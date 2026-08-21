/**
 * -----------------------------------------------------------------------------
 * VoiceCreateDialog
 * -----------------------------------------------------------------------------
 * Responsive host for the voice creation form: renders VoiceCreateForm inside
 * a desktop Dialog or a mobile Drawer (via useIsMobile). It exists to own the
 * presentation concerns of the creation flow — overlay type, footer buttons,
 * and error handling — while the form itself stays host-agnostic.
 *
 * Open state is controlled from outside (voices-view.tsx binds it to the
 * `?cloning=` URL param), but an optional trigger child is supported for
 * uncontrolled usage. Errors are intercepted so a "SUBSCRIPTION REQUIRED"
 * response from /api/voices/create surfaces as a toast with a Subscribe
 * action that launches the billing checkout flow.
 */
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceCreateForm } from "./voice-create-form";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/features/billing/hooks/use-checkout";
import { useCallback } from "react";
import { toast } from "sonner";

/** Props for {@link VoiceCreateDialog}. */
interface VoiceCreateDialogProps {
  /** Optional element that, when rendered, acts as the open trigger. */
  children?: React.ReactNode;
  /** Controlled open state (bound to the `cloning` URL param by voices-view). */
  open?: boolean;
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Renders the creation flow in a Dialog (desktop) or Drawer (mobile).
 *
 * @param children - Optional trigger element wrapped in the overlay's trigger.
 * @param open - Controlled visibility of the overlay.
 * @param onOpenChange - Called when the overlay requests to open/close.
 * @returns The responsive overlay containing the VoiceCreateForm.
 */
export function VoiceCreateDialog({
  children,
  open,
  onOpenChange,
}: VoiceCreateDialogProps) {
  const isMobile = useIsMobile();

  // Launches the Polar checkout flow offered when creation is blocked.
  const { checkout } = useCheckout();

  // Maps form submission errors to user-facing toasts; the sentinel
  // "SUBSCRIPTION REQUIRED" (returned with 403 by /api/voices/create) gets a
  // subscribe CTA instead of a bare error message.
  const handleError = useCallback(
    (message: string) => {
      if (message === "SUBSCRIPTION REQUIRED") {
        toast.error("Subscription required", {
          action: {
            label: "Subscribe",
            onClick: () => checkout(),
          },
        });
      } else {
        toast.error(message);
      }
    },
    [checkout],
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create custom voice</DrawerTitle>
            <DrawerDescription>
              Upload or record an audio sample to add a new voice to your
              library.
            </DrawerDescription>
          </DrawerHeader>
          {/* Scrollable layout keeps the submit/cancel actions pinned in the
              drawer footer while the fields scroll above them. */}
          <VoiceCreateForm
            scrollable
            onError={handleError}
            footer={(submit) => (
              <DrawerFooter>
                {submit}
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            )}
          />
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Create custom voice</DialogTitle>
          <DialogDescription>
            Upload or record an audio sample to add a new voice to your library.
          </DialogDescription>
        </DialogHeader>
        <VoiceCreateForm onError={handleError} />
      </DialogContent>
    </Dialog>
  );
};