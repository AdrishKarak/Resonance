/**
 * -----------------------------------------------------------------------------
 * VoicesToolbar
 * -----------------------------------------------------------------------------
 * Header controls for the Voices page: a debounced search input and the
 * "Custom voice" button that opens the creation dialog. It exists to keep all
 * user-driven filtering/dialog triggers in one bar above the voice lists.
 *
 * Both controls communicate through URL search params (nuqs) rather than
 * local parent state: typing updates `?query=` (consumed by voices-view.tsx
 * to filter `trpc.voices.getAll` server-side), and clicking "Custom voice"
 * sets `?cloning=true`, which opens the VoiceCreateDialog. This makes search
 * results and the open dialog shareable/bookmarkable.
 */
import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from "@/components/ui/input-group";
import { voicesSearchParams } from "@/features/voices/lib/params";


/**
 * Renders the page heading, search input, and custom-voice trigger.
 *
 * @returns The toolbar markup bound to the `query` and `cloning` URL params.
 */
export function VoicesToolbar() {
    // Writer for the ?query= param consumed by voices-view's tRPC query.
    const [query, setQuery] = useQueryState(
        "query",
        voicesSearchParams.query
    );
    // Only the setter is needed here; dialog open state is read in voices-view.
    const [, setCloning] = useQueryState(
        "cloning",
        voicesSearchParams.cloning
    );
    // Local mirror of the query so the input feels instant; the URL (and thus
    // the server query) only updates after the debounce below.
    const [localQuery, setLocalQuery] = useState(query);

    // Debounce URL writes to avoid re-running the tRPC query on every keystroke.
    const debouncedSetQuery = useDebouncedCallback(
        (value: string) => setQuery(value),
        300,
    );

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl lg:text-2xl font-semibold tracking-tight">
                    All Libraries
                </h2>
                <p className="text-sm text-muted-foreground">
                    Discover your voices, or make your own
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <InputGroup className="lg:max-w-sm">
                        <InputGroupAddon>
                            <Search className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search voices..."
                            value={localQuery}
                            onChange={(e) => {
                                // Update the input immediately for responsiveness,
                                // but push to the URL (and trigger refetch) debounced.
                                setLocalQuery(e.target.value);
                                debouncedSetQuery(e.target.value);
                            }}
                        />
                    </InputGroup>
                    <div className="ml-auto hidden lg:block">
                        <Button size="sm" onClick={() => setCloning(true)}>
                            <Sparkles />
                            Custom voice
                        </Button>
                    </div>
                    <div className="lg:hidden">
                        <Button size="sm" className="w-full" onClick={() => setCloning(true)}>
                            <Sparkles />
                            Custom voice
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};