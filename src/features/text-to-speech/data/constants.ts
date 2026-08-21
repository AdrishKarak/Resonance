/**
 * -----------------------------------------------------------------------------
 * TTS constants
 * -----------------------------------------------------------------------------
 * Shared numeric constants for the text-to-speech feature. TEXT_MAX_LENGTH
 * caps the input textarea (and drives the character counter) in
 * TextInputPanel, while COST_PER_UNIT is the per-character price used to show
 * the estimated generation cost badge.
 */

/** Maximum number of characters allowed in the TTS text input. */
export const TEXT_MAX_LENGTH = 5000;

/** Estimated cost per character of generated speech, in dollars. */
export const COST_PER_UNIT = 0.0003;
