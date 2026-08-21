"use client";

/**
 * -----------------------------------------------------------------------------
 * TanStack Form integration
 * -----------------------------------------------------------------------------
 * Central wiring for TanStack React Form's "form hook" pattern. It creates the
 * shared field/form contexts once and exposes `useAppForm` (and its typed
 * context helper) so every form in the app shares one configured instance.
 * Field components register themselves against these contexts, which lets
 * forms compose pre-bound field UI without prop-drilling form state. Import
 * `useAppForm` from here rather than calling `createFormHook` per feature.
 */
import {
    createFormHookContexts,
    createFormHook,
} from "@tanstack/react-form";

/**
 * App-wide form/field React contexts plus the `useFieldContext` /
 * `useFormContext` accessors that reusable field components use to reach
 * their parent form's state.
 */
export const {
    fieldContext,
    formContext,
    useFieldContext,
    useFormContext,
} = createFormHookContexts();

/**
 * The app's single configured form factory.
 *
 * `fieldComponents`/`formComponents` are intentionally empty today; they are
 * the registration point if pre-bound field components are added later.
 */
export const {
    useAppForm,
    useTypedAppFormContext,
} = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {},
    formComponents: {},
});