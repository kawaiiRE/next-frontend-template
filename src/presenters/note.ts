import type { Note, NotesPage } from '@/contracts/note';
import type { PocketBaseNote } from '@/contracts/pocketbase';

/** PocketBase note record -> allowlisted gateway `Note` (drops `owner`). */
export function presentNote(record: PocketBaseNote): Note {
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    archived: record.archived,
    createdAt: record.created,
    updatedAt: record.updated,
  };
}

export function presentNotesPage(list: {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: PocketBaseNote[];
}): NotesPage {
  return {
    items: list.items.map(presentNote),
    page: list.page,
    perPage: list.perPage,
    totalItems: Math.max(0, list.totalItems),
    totalPages: Math.max(0, list.totalPages),
  };
}

const EXCERPT_LENGTH = 180;

/** Application-facing note model for components. */
export interface NoteViewModel {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  wasEdited: boolean;
}

export function presentNoteView(note: Note): NoteViewModel {
  const collapsed = note.body.replace(/\s+/g, ' ').trim();
  const chars = Array.from(collapsed);
  const excerpt =
    chars.length > EXCERPT_LENGTH
      ? `${chars.slice(0, EXCERPT_LENGTH).join('').trimEnd()}…`
      : collapsed;

  return {
    id: note.id,
    title: note.title.trim(),
    body: note.body,
    excerpt,
    archived: note.archived,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    wasEdited: Date.parse(note.updatedAt) - Date.parse(note.createdAt) > 1000,
  };
}

export interface NotesPageViewModel {
  items: NoteViewModel[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export function presentNotesPageView(page: NotesPage): NotesPageViewModel {
  return { ...page, items: page.items.map(presentNoteView) };
}
