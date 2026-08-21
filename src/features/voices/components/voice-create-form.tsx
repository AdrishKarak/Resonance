"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    AudioLines,
    FolderOpen,
    X,
    FileAudio,
    Upload,
    Mic,
    Tag,
    Play,
    Pause,
    Check,
    ChevronsUpDown,
    Globe,
    Layers,
    AlignLeft,
} from "lucide-react";
import locales from "locale-codes";

import { cn, formatFileSize } from "@/lib/utils";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useTRPC } from "@/trpc/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    VOICE_CATEGORIES,
    VOICE_CATEGORY_LABELS,
} from "@/features/voices/data/voice-categories";
import { VoiceRecorder } from "./voice-recorder";


// Searchable language list for the combobox: only locale tags with a country
// subtag (e.g. "en-US") are offered, since the voice card UI derives its
// flag/region display from that subtag.
const LANGUAGE_OPTIONS = locales.all
    .filter((l) => l.tag && l.tag.includes("-") && l.name)
    .map((l) => ({
        value: l.tag,
        label: l.location ? `${l.name} (${l.location})` : l.name,
    }));

/**
 * Zod schema mirroring the server-side validation in /api/voices/create.
 * Runs on submit (TanStack Form `validators.onSubmit`); the file field must
 * be a non-null File instance, which is what both the dropzone and recorder
 * produce via `onFileChange`.
 */
const voiceCreateFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    file: z
        .instanceof(File, { message: "An audio file is required" })
        .nullable()
        .refine((f) => f !== null, "An audio file is required"),
    category: z.string().min(1, "A category is required"),
    language: z.string().min(1, "A language is required"),
    description: z.string(),
});

/**
 * Upload tab content: a drag-and-drop dropzone that collapses into a file
 * preview (with playback and remove actions) once a file is chosen.
 * Accepts any audio format up to 20 MB — the same cap enforced server-side by
 * /api/voices/create, so users get early feedback before uploading.
 *
 * @param file - Current file on the form field; presence switches to preview.
 * @param onFileChange - Writes the accepted file (or null on remove) to the
 *   form's `file` field.
 * @param isInvalid - Highlights the dropzone border when validation failed.
 * @returns The dropzone or preview markup.
 */
function FileDropzone({
    file,
    onFileChange,
    isInvalid,
}: {
    file: File | null;
    onFileChange: (file: File | null) => void;
    isInvalid?: boolean;
}) {
    // In-browser playback of the selected file for previewing.
    const { isPlaying, togglePlay } = useAudioPlayback(file);

    const {
        getRootProps, getInputProps, isDragActive, isDragReject
    } = useDropzone({
        accept: { "audio/*": [] },
        maxSize: 20 * 1024 * 1024,
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                onFileChange(acceptedFiles[0]);
            }
        },
    });

    if (file) {
        return (
            <div className="flex items-center gap-3 rounded-xl border p-4">

                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <FileAudio className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={togglePlay}
                >
                    {isPlaying ? (
                        <Pause className="size-4" />
                    ) : (
                        <Play className="size-4" />
                    )}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onFileChange(null)}
                >
                    <X className="size-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10 transition-colors",
                isDragReject || isInvalid
                    ? "border-destructive"
                    : isDragActive
                        ? "border-primary"
                        : "",
            )}
        >
            <input {...getInputProps()} />
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <AudioLines className="size-5 text-muted-foreground" />
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <p className="text-base font-semibold tracking-tight">
                    Upload your audio file
                </p>

                <p className="text-center text-sm text-muted-foreground">
                    Supports all audio formats, max size 20MB
                </p>
            </div>

            <Button type="button" variant="outline" size="sm">
                <FolderOpen className="size-3.5" />
                Upload file
            </Button>
        </div>
    )
};

/**
 * Searchable language selector: a popover combobox over the full
 * `LANGUAGE_OPTIONS` list. Stores the raw locale tag (e.g. "en-US") as the
 * form value while displaying the friendly label.
 *
 * @param value - Currently selected locale tag.
 * @param onChange - Writes the selected tag back to the form field.
 * @param isInvalid - Marks the trigger with aria-invalid styling on error.
 * @returns The combobox markup.
 */
function LanguageCombobox({
    value,
    onChange,
    isInvalid,
}: {
    value: string;
    onChange: (value: string) => void;
    isInvalid?: boolean;
}) {
    const [open, setOpen] = useState(false);

    const selectedLabel =
        LANGUAGE_OPTIONS.find((l) => l.value === value)?.label ?? "";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={isInvalid}
                    className={cn(
                        "h-9 w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        {value ? selectedLabel : "Select language..."}
                    </div>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <CommandItem
                                    key={lang.value}
                                    value={lang.label}
                                    onSelect={() => {
                                        onChange(lang.value);
                                        setOpen(false);
                                    }}
                                >
                                    {lang.label}
                                    <Check
                                        className={cn(
                                            "ml-auto size-4",
                                            value === lang.value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

/** Props for {@link VoiceCreateForm}. */
interface VoiceCreateFormProps {
    /** When true, the fields area becomes a flex-filling scroll region (used
     *  inside the mobile Drawer so its footer stays pinned). */
    scrollable?: boolean;
    /** Optional render prop receiving the submit button, letting hosts place
     *  it in their own footer (e.g. DrawerFooter with a Cancel button). */
    footer?: (submit: React.ReactNode) => React.ReactNode;
    /** Optional error handler; when provided it replaces the default toast,
     *  used by the dialog to special-case "SUBSCRIPTION REQUIRED". */
    onError?: (message: string) => void;
};

/**
 * Renders the full voice creation form and owns its submission lifecycle.
 *
 * @param scrollable - Enables the drawer-friendly scrolling layout.
 * @param footer - Render prop for custom placement of the submit button.
 * @param onError - Custom error sink overriding the default toast.
 * @returns The form markup: sample tabs, metadata fields, and submit action.
 */
export function VoiceCreateForm({
    scrollable,
    footer,
    onError,
}: VoiceCreateFormProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Submission goes straight to the /api/voices/create Route Handler rather
    // than tRPC because the payload is a raw binary audio file. Metadata
    // travels as query params so the body can remain a pure byte stream.
    const createMutation = useMutation({
        mutationFn: async ({
            name,
            file,
            category,
            language,
            description,
        }: {
            name: string;
            file: File;
            category: string;
            language: string;
            description?: string;
        }) => {
            const params = new URLSearchParams({
                name,
                category,
                language,
            });
            if (description) {
                params.set("description", description);
            }

            // Content-Type is set from the file's MIME type so the server's
            // music-metadata parser receives an accurate hint.
            const response =
                await fetch(`/api/voices/create?${params.toString()}`, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.error ?? "Failed to create voice");
            }

            return response.json();
        },
    });

    const form = useForm({
        // Defaults chosen so the form is valid-ish out of the box except for
        // the required file/name; category/language have sensible presets.
        defaultValues: {
            name: "",
            file: null as File | null,
            category: "GENERAL" as string,
            language: "en-US",
            description: "",
        },
        validators: {
            onSubmit: voiceCreateFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await createMutation.mutateAsync({
                    name: value.name,
                    // Non-null asserted: the zod schema guarantees a File here.
                    file: value.file!,
                    category: value.category,
                    language: value.language,
                    description: value.description || undefined,
                });

                toast.success("Voice created successfully!");
                // Refetch lists so the new custom voice appears immediately…
                queryClient.invalidateQueries({
                    queryKey: trpc.voices.getAll.queryKey(),
                });
                // …and refresh billing since each creation is metered usage.
                queryClient.invalidateQueries({
                    queryKey: trpc.billing.getStatus.queryKey(),
                });
                form.reset();
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to create voice";

                // Surface via host-provided handler (lets the dialog react to
                // "SUBSCRIPTION REQUIRED") or fall back to a plain toast.
                if (onError) {
                    onError(message);
                } else {
                    toast.error(message);
                }
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            className={cn(
                "flex flex-col",
                scrollable ? "min-h-0 flex-1" : "gap-6"
            )}
        >
            <div
                className={cn(
                    scrollable
                        ? "no-scrollbar flex flex-col gap-6 overflow-y-auto px-4"
                        : "flex flex-col gap-6",
                )}
            >
                {/* Step 1: audio sample. Both tabs write to the same `file`
                    form field, so switching tabs mid-flow preserves the take. */}
                <form.Field name="file">
                    {(field) => {
                        // Errors only surface after the user has interacted
                        // (or a submit attempt touched the field).
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <Tabs defaultValue="upload">
                                    <TabsList className="h-11! w-full">
                                        <TabsTrigger value="upload">
                                            <Upload className="size-3.5" />
                                            Upload
                                        </TabsTrigger>
                                        <TabsTrigger value="record">
                                            <Mic className="size-3.5" />
                                            Record
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload">
                                        <FileDropzone
                                            file={field.state.value}
                                            onFileChange={field.handleChange}
                                            isInvalid={isInvalid}
                                        />
                                    </TabsContent>
                                    <TabsContent value="record">
                                        <VoiceRecorder
                                            file={field.state.value}
                                            onFileChange={field.handleChange}
                                            isInvalid={isInvalid}
                                        />
                                    </TabsContent>
                                </Tabs>
                                {isInvalid
                                    && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                {/* Step 2: voice label. */}
                <form.Field name="name">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="relative flex items-center">
                                    <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                                        <Tag className="size-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id={field.name}
                                        placeholder="Voice Label"
                                        aria-invalid={isInvalid}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        className="pl-10"
                                    />

                                </div>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                {/* Step 3: category, options sourced from the Prisma enum
                    constants shared with server-side validation. */}
                <form.Field name="category">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="relative flex items-center">
                                    <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                                        <Layers className="size-4 text-muted-foreground" />
                                    </div>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                    >
                                        <SelectTrigger className="w-full pl-10">
                                            <SelectValue
                                                placeholder="Select category..."
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VOICE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {VOICE_CATEGORY_LABELS[cat]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                {/* Step 4: language via searchable combobox. */}
                <form.Field name="language">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                            <Field data-invalid={isInvalid}>
                                <LanguageCombobox
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    isInvalid={isInvalid}
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                {/* Step 5: optional description. */}
                <form.Field name="description">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="relative flex items-center">
                                    <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                                        <AlignLeft className="size-4 text-muted-foreground" />
                                    </div>
                                    <Textarea
                                        id={field.name}
                                        placeholder="Describe this voice..."
                                        aria-invalid={isInvalid}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        className="min-h-20 pl-10"
                                        rows={3}
                                    />

                                </div>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                {/* Submit button subscribes only to isSubmitting so it
                    re-renders in isolation; hosts may relocate it via the
                    footer render prop (e.g. into a DrawerFooter). */}
                <form.Subscribe
                    selector={(s) => ({
                        isSubmitting: s.isSubmitting,
                    })}
                >
                    {({ isSubmitting }) => {
                        const submitButton = (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Voice"}
                            </Button>
                        );

                        return footer ? footer(submitButton) : submitButton;
                    }}
                </form.Subscribe>
            </div>
        </form>
    )
};