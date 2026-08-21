/**
 * -----------------------------------------------------------------------------
 * Settings drawer
 * -----------------------------------------------------------------------------
 * Mobile-friendly bottom sheet that hosts the same SettingsPanelSettings content
 * as the desktop SettingsPanel tabs. It exists so small screens can still reach
 * voice selection and generation tuning; on mobile, TextInputPanel nests the
 * VoiceSelectorButton inside this drawer as its trigger, so tapping the voice
 * button opens the full settings sheet.
 */
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import {
    SettingsPanelSettings
} from "./settings-panel-settings";

/**
 * Props for SettingsDrawer.
 */
interface SettingsDrawerProps {
    /** Controlled open state of the drawer. */
    open?: boolean;
    /** Open-state change handler for controlled usage. */
    onOpenChange?: (open: boolean) => void;
    /**
     * Optional custom trigger. When omitted, a default icon-button trigger is
     * rendered (TextInputPanel instead passes VoiceSelectorButton asChild).
     */
    children?: React.ReactNode;
};

/**
 * Renders the mobile settings drawer wrapping SettingsPanelSettings.
 *
 * @param props - See {@link SettingsDrawerProps}.
 * @returns The drawer element with its trigger and settings content.
 */
export function SettingsDrawer({
    open,
    onOpenChange,
    children,
}: SettingsDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {children ?? (
                <DrawerTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Settings className="size-4" />
                    </Button>
                </DrawerTrigger>
            )}
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Settings</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto">
                    <SettingsPanelSettings />
                </div>
            </DrawerContent>
        </Drawer>
    );
};