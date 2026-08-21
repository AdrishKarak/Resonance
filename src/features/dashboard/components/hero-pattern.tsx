/**
 * -----------------------------------------------------------------------------
 * Dashboard hero pattern
 * -----------------------------------------------------------------------------
 * A purely decorative animated wave background rendered behind the dashboard
 * content. It wraps the `WavyBackground` UI primitive with Sonic's brand
 * palette and fixed tuning (speed, opacity, wave count) so the dashboard
 * doesn't need to know those details. Desktop-only (`hidden lg:block`) and
 * `pointer-events-none` so it never intercepts clicks meant for content
 * above it. Consumed by `DashboardView`.
 */
import { WavyBackground } from "@/components/ui/wavy-background";

/**
 * Renders the absolute-positioned decorative wave backdrop.
 *
 * @returns A non-interactive, full-bleed container with the animated waves;
 * renders nothing on viewports below the `lg` breakpoint.
 */
export function HeroPattern() {
    return (
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
            <WavyBackground
                colors={["#2DD4BF", "#22D3EE", "#38BDF8", "#818CF8"]}
                blur={0}
                speed="fast"
                waveOpacity={0.3}
                waveWidth={50}
                waveCount={6}
                containerClassName="h-full w-full"
                className="hidden"
            />
        </div>
    );
}
