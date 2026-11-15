'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Form, FormActions } from '@/components/ui/Form';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { NOTE_BODY_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '@/contracts/note';
import { useNoteForm } from './logic';

interface NoteFormProps {
  note?: { id: string; title: string; body: string };
  cancelHref: string;
}

export function NoteForm({ note, cancelHref }: NoteFormProps) {
  const t = useTranslations('notes.form');
  const common = useTranslations('common');
  const { handleSubmit, fieldErrors, formError, pending } = useNoteForm(note?.id ?? null);
  const editing = Boolean(note);

  return (
    <Card>
      <Form onSubmit={handleSubmit}>
        {formError ? (
          <Alert tone="danger" live>
            {formError}
          </Alert>
        ) : null}
        <TextField
          label={t('titleLabel')}
          name="title"
          placeholder={t('titlePlaceholder')}
          defaultValue={note?.title}
          maxLength={NOTE_TITLE_MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="next"
          required
          autoFocus={!editing}
          error={fieldErrors.title}
        />
        <Textarea
          label={t('bodyLabel')}
          name="body"
          placeholder={t('bodyPlaceholder')}
          defaultValue={note?.body}
          maxLength={NOTE_BODY_MAX_LENGTH}
          optionalLabel={common('optional')}
          showCount
          error={fieldErrors.body}
        />
        <FormActions>
          <ButtonLink href={cancelHref} variant="ghost">
            {common('cancel')}
          </ButtonLink>
          <Button type="submit" loading={pending}>
            {editing ? (pending ? t('saving') : t('save')) : pending ? t('creating') : t('create')}
          </Button>
        </FormActions>
      </Form>
    </Card>
  );
}
