"use client";

/**
 * -----------------------------------------------------------------------------
 * Dashboard text input panel
 * -----------------------------------------------------------------------------
 * The hero text box on the dashboard where users paste or type the text they
 * want to convert to speech. It shows a live cost estimate (using the shared
 * `COST_PER_UNIT` constant) and a character counter, then hands off to the
 * dedicated `/text-to-speech` page by pushing the trimmed text as a `text`
 * query param — generation itself happens there, not here. Consumed by
 * `DashboardView`.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
    COST_PER_UNIT,
    TEXT_MAX_LENGTH
} from "@/features/text-to-speech/data/constants";

/**
 * Dashboard entry point for text-to-speech: captures text, estimates cost,
 * and navigates to the TTS workspace with the text pre-filled.
 *
 * @returns The gradient-bordered textarea panel with cost/character badges
 * and a "Generate speech" action.
 */
export function TextInputPanel() {
    const [text, setText] = useState("");
    const router = useRouter();

    // Navigation (not generation) keeps this panel lightweight: the TTS page
    // reads `?text=` and owns voice selection and actual audio generation.
    const handleGenerate = () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        router.push(`/text-to-speech?text=${encodeURIComponent(trimmed)}`);
    };

    return (
        <div className="
      rounded-[22px] bg-linear-185 from-[#ff8ee3] from-15% via-[#57d7e0] via-39% to-[#dbf1f2] to-85% p-0.5 shadow-[0_0_0_4px_white]
    ">
            {/* Using px values for border-radius to ensure proper gradient border math (outer - padding = inner). */}
            {/* Standard classes like rounded-4xl use CSS calc() which doesn't align cleanly at corners. */}
            <div className="rounded-[20px] bg-[#F9F9F9] p-1">
                <div className="space-y-4 rounded-2xl bg-white p-4 drop-shadow-xs">
                    <Textarea
                        placeholder="Start typing or paste your text here..."
                        className="min-h-35 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={TEXT_MAX_LENGTH}
                    />

                    {/* Bottom info */}

                    <div className="flex items-center justify-between">
                        {/* Live cost estimate: characters x per-unit price,
                            shown to 4 decimals since costs are sub-cent. */}
                        <Badge variant="outline" className="gap-1.5 border-dashed">
                            <Coins className="size-3 text-chart-5" />
                            <span className="text-xs">
                                {text.length === 0 ? (
                                    "Start typing to estimate"
                                ) : (
                                    <>
                                        <span className="tabular-nums">
                                            ${(text.length * COST_PER_UNIT).toFixed(4)}
                                        </span>{" "}
                                        estimated
                                    </>
                                )}
                            </span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()} characters
                        </span>
                    </div>
                </div>

                {/* Action bar */}

                <div className="flex items-center justify-end p-3">
                    <Button
                        size="sm"
                        disabled={!text.trim()}
                        onClick={handleGenerate}
                        className="w-full lg:w-auto"
                    >
                        Generate speech
                    </Button>
                </div>
            </div>
        </div>
    )
}