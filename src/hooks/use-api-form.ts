'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState, type FormEvent } from 'react';
import type { ZodType } from 'zod';
import { isFieldErrorCode, type FieldErrorCode } from '@/contracts/api-error';
import { useApiError } from '@/hooks/use-api-error';
import type { ApiError } from '@/services/api';

export type FieldMessages = Record<string, string>;

interface UseApiFormOptions<T> {
  schema: ZodType<T>;
  /** Performs the request. Return an `ApiError` to show it, or `null` on success. */
  onSubmit: (values: T, form: HTMLFormElement) => Promise<ApiError | null>;
}

/**
 * Uncontrolled form handling: Zod validation on submit (same schemas as the gateway), field-level
 * messages for client and server (`fields`) errors, a form-level error and focus on the first
 * invalid field.
 */
export function useApiForm<T>({ schema, onSubmit }: UseApiFormOptions<T>) {
  const t = useTranslations('validation');
  const { messageFor: errorMessage, handleSessionExpiry } = useApiError();
  const [fieldErrors, setFieldErrors] = useState<FieldMessages>({});
  const [formError, setFormError] = useState<{ code: string; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  const fieldMessage = useCallback(
    (code: string) => t(isFieldErrorCode(code) ? code : ('invalid' satisfies FieldErrorCode)),
    [t],
  );

  const focusField = (form: HTMLFormElement, name: string | undefined) => {
    if (!name) return;
    const element = form.elements.namedItem(name);
    if (element instanceof HTMLElement) element.focus();
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (pending) return;
      const form = event.currentTarget;
      const raw = Object.fromEntries(
        Array.from(new FormData(form).entries()).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      );

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        const messages: FieldMessages = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? 'form');
          messages[key] ??= fieldMessage(issue.message);
        }
        setFieldErrors(messages);
        setFormError(null);
        focusField(form, Object.keys(messages)[0]);
        return;
      }

      setPending(true);
      setFieldErrors({});
      setFormError(null);
      try {
        const error = await onSubmit(parsed.data, form);
        if (!error || handleSessionExpiry(error)) return;

        const messages: FieldMessages = {};
        for (const [key, code] of Object.entries(error.fields ?? {}))
          messages[key] = fieldMessage(code);
        setFieldErrors(messages);
        setFormError(
          Object.keys(messages).length > 0 && error.code === 'INVALID_INPUT'
            ? null
            : { code: error.code, message: errorMessage(error.code) },
        );
        focusField(form, Object.keys(messages)[0]);
      } finally {
        setPending(false);
      }
    },
    [errorMessage, fieldMessage, handleSessionExpiry, onSubmit, pending, schema],
  );

  return {
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void handleSubmit(event),
    fieldErrors,
    formError: formError?.message ?? null,
    /** Machine-readable code of the form-level error, for follow-up actions (e.g. resend email). */
    formErrorCode: formError?.code ?? null,
    pending,
  };
}
