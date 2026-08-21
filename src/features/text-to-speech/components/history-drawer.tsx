/**
 * -----------------------------------------------------------------------------
 * History drawer
 * -----------------------------------------------------------------------------
 * Mobile-only entry point to the generation history: a bottom sheet (Drawer)
 * triggered by a history icon button that hosts the same SettingsPanelHistory
 * list used in the desktop settings panel. Exists so mobile users can browse
 * past generations without the persistent desktop side panel.
 */
import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import {
    SettingsPanelHistory
} from "./settings-panel-history";

/**
 * Renders a history icon button that opens a bottom drawer containing the
 * generation history list.
 *
 * @returns The drawer-wrapped history list with its trigger button.
 */
export function HistoryDrawer() {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                    <History className="size-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>History</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto">
                    <SettingsPanelHistory />
                </div>
            </DrawerContent>
        </Drawer>
    );
};