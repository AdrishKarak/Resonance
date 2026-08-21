"use client";

/**
 * -----------------------------------------------------------------------------
 * Dashboard sidebar
 * -----------------------------------------------------------------------------
 * The persistent app shell navigation for authenticated pages. It combines
 * Clerk's `OrganizationSwitcher` (workspaces are the billing/usage unit in the
 * app) with feature navigation links, a Clerk `UserButton`, and the billing
 * `UsageContainer` in the footer. Built on shadcn/ui's collapsible Sidebar so
 * it collapses to icons on desktop and becomes an overlay on mobile. Rendered
 * by the dashboard layout; active states derive from the current pathname.
 */
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    OrganizationSwitcher,
    UserButton,
    useClerk
} from "@clerk/nextjs";
import {
    type LucideIcon,
    Home,
    LayoutGrid,
    AudioLines,
    Volume2,
    Settings,
    Headphones,
} from "lucide-react";
import Link from "next/link";
import { UsageContainer } from "@/features/billing/components/usage-container";
//import { VoiceCreateDialog } from "@/features/voices/components/voice-create-dialog";
import { useState } from "react";

/** A single sidebar entry: either a `Link` (when `url` is set) or a button. */
interface MenuItem {
    title: string;
    url?: string;
    icon: LucideIcon;
    onClick?: () => void;
};

/** Props for {@link NavSection}. */
interface NavSectionProps {
    label?: string;
    items: MenuItem[];
    pathname: string;
};

/**
 * Renders a labeled group of menu items with active-route highlighting.
 *
 * @param label - Optional uppercase group heading (e.g. "Others").
 * @param items - The menu entries to render in order.
 * @param pathname - Current route, used to mark the active item.
 */
function NavSection({ label, items, pathname }: NavSectionProps) {
    return (
        <SidebarGroup>
            {label && (
                <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild={!!item.url}
                                isActive={
                                    item.url
                                        // "/" must match exactly, otherwise every
                                        // route would highlight the Dashboard item.
                                        ? item.url === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(item.url)
                                        : false
                                }
                                onClick={item.onClick}
                                tooltip={item.title}
                                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
                            >
                                {item.url ? (
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                ) : (
                                    <>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

/**
 * The main application sidebar: logo, Clerk organization switcher, primary
 * navigation, and the footer with billing usage + user menu.
 *
 * @returns The collapsible `Sidebar` shell used across authenticated pages.
 */
export function DashboardSidebar() {
    const pathname = usePathname();
    // Gives access to Clerk's imperative APIs; used to open the org profile
    // popover as the app's "Settings" surface (org name, members, etc.).
    const clerk = useClerk();

    const mainMenuItems: MenuItem[] = [
        {
            title: "Dashboard",
            url: "/",
            icon: Home,
        },
        {
            title: "Explore voices",
            url: "/voices",
            icon: LayoutGrid,
        },
        {
            title: "Text to speech",
            url: "/text-to-speech",
            icon: AudioLines,
        },
        {
            title: "Voice cloning",
            url: "/voices?cloning=true",
            icon: Volume2,
        },
    ];

    const othersMenuItems: MenuItem[] = [
        {
            // No route: opens Clerk's organization profile popover instead of
            // navigating, keeping org management inside the current page.
            title: "Settings",
            icon: Settings,
            onClick: () => clerk.openOrganizationProfile(),
        },
        {
            title: "Help and support",
            url: "mailto:adrishkarak@gmail.com",
            icon: Headphones,
        },
    ];

    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader className="flex flex-col gap-4 pt-4">
                    <Link
                        href="/landing"
                        className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
                        <Image
                            src="/logo.svg"
                            alt="Sonic"
                            width={24}
                            height={24}
                            className="rounded-sm"
                        />
                        <span className="group-data-[collapsible=icon]:hidden font-semibold text-xl tracking-tighter text-foreground">
                            Sonic
                        </span>
                        <SidebarTrigger className="ml-auto lg:hidden" />
                    </Link>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            {/* Clerk org switcher: switching the active
                                organization changes the billing/usage scope
                                everywhere in the app. `hidePersonal` because
                                the app is workspace-based. */}
                            <OrganizationSwitcher
                                hidePersonal
                                fallback={
                                    <Skeleton
                                        className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border bg-white"
                                    />
                                }
                                appearance={{
                                    elements: {
                                        rootBox:
                                            "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                                        organizationSwitcherTrigger:
                                            "w-full! justify-between! bg-white! border! border-border! rounded-md! pl-1! pr-2! py-1! gap-3! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! shadow-[0px_1px_1.5px_0px_rgba(44,54,53,0.03)]!",
                                        organizationPreview: "gap-2!",
                                        organizationPreviewAvatarBox: "size-6! rounded-sm!",
                                        organizationPreviewTextContainer:
                                            "text-xs! tracking-tight! font-medium! text-foreground! group-data-[collapsible=icon]:hidden!",
                                        organizationPreviewMainIdentifier: "text-[13px]!",
                                        organizationSwitcherTriggerIcon:
                                            "size-4! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                                    },
                                }}
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <div className="border-b border-dashed border-border" />
                <SidebarContent>
                    <NavSection items={mainMenuItems} pathname={pathname} />
                    <NavSection
                        label="Others"
                        items={othersMenuItems}
                        pathname={pathname}
                    />
                </SidebarContent>
                <div className="border-b border-dashed border-border" />
                <SidebarFooter className="gap-3 py-3">
                    {/* Billing widget: upgrade CTA or current usage, scoped to
                        the active Clerk organization. */}
                    <UsageContainer />
                    <SidebarMenu>
                        <SidebarMenuItem>
                            {/* Clerk user menu (account settings, sign out). */}
                            <UserButton
                                showName
                                fallback={
                                    <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border border-border bg-white" />
                                }
                                appearance={{
                                    elements: {
                                        rootBox:
                                            "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                                        userButtonTrigger:
                                            "w-full! justify-between! bg-white! border! border-border! rounded-md! pl-1! pr-2! py-1! shadow-[0px_1px_1.5px_0px_rgba(44,54,53,0.03)]! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! group-data-[collapsible=icon]:after:hidden! [--border:color-mix(in_srgb,transparent,var(--clerk-color-neutral,#000000)_15%)]!",
                                        userButtonBox: "flex-row-reverse! gap-2!",
                                        userButtonOuterIdentifier: "text-[13px]! tracking-tight! font-medium! text-foreground! pl-0! group-data-[collapsible=icon]:hidden!",
                                        userButtonAvatarBox: "size-6!",
                                    }
                                }}
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </>
    );
}