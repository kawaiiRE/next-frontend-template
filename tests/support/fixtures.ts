import type { Note } from '../../src/contracts/note';
import type { User } from '../../src/contracts/user';

/** Worst-case gateway DTOs (schema limits, mixed scripts, emoji, markup) for presenter tests. */
const at = (iso: string) => new Date(iso).toISOString();

export const WORST_CASE_USERS: User[] = [
  {
    id: 'worstuser000001',
    email: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com',
    name: 'Aleksandra Wiśniewska-Kowalczyk',
    verified: false,
    isGuest: false,
    locale: null,
    createdAt: at('2019-01-01T00:00:00Z'),
  },
  {
    id: 'worstuser000002',
    email: 'jo@example.com',
    name: 'Jo',
    verified: true,
    isGuest: false,
    locale: 'en',
    createdAt: at('2026-10-01T00:00:00Z'),
  },
  {
    id: 'worstuser000003',
    email: 'christopher@example.com',
    name: 'Christopher Alexander Montgomery III',
    verified: true,
    isGuest: false,
    locale: 'en',
    createdAt: at('2024-05-05T00:00:00Z'),
  },
  {
    id: 'worstuser000004',
    email: 'nour@example.com',
    name: 'نور الهدى عبد الرحمن',
    verified: true,
    isGuest: false,
    locale: 'ar',
    createdAt: at('2025-02-14T00:00:00Z'),
  },
  {
    id: 'worstuser000005',
    email: 'fox@example.com',
    name: '🦊 Fox',
    verified: true,
    isGuest: false,
    locale: null,
    createdAt: at('2025-07-07T00:00:00Z'),
  },
  {
    id: 'worstuser000006',
    email: 'a@b.co',
    name: '',
    verified: true,
    isGuest: false,
    locale: null,
    createdAt: at('2025-07-07T00:00:00Z'),
  },
];

export const WORST_CASE_NOTES: Note[] = [
  {
    id: 'worstnote000001',
    title:
      'Q3 Board Deck — FINAL (revised) v12 [approved by legal] — Benachrichtigungseinstellungen und Paramètres de confidentialité et de sécurité for the EMEA region'.slice(
        0,
        160,
      ),
    body: 'https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved '.repeat(
      3,
    ),
    archived: false,
    createdAt: at('2023-01-01T00:00:00Z'),
    updatedAt: at('2026-10-18T09:59:00Z'),
  },
  {
    id: 'worstnote000002',
    title: 'J',
    body: '',
    archived: true,
    createdAt: at('2026-10-18T09:00:00Z'),
    updatedAt: at('2026-10-18T09:00:00Z'),
  },
  {
    id: 'worstnote000003',
    title: 'ملاحظات اجتماع فريق المنتج حول خطة الإطلاق في الربع القادم',
    body: 'نناقش الأولويات، ونحدد المسؤوليات، ونتفق على مواعيد التسليم. '.repeat(8),
    archived: false,
    createdAt: at('2025-02-01T00:00:00Z'),
    updatedAt: at('2025-12-31T23:30:00Z'),
  },
  {
    id: 'worstnote000004',
    title: '<script>alert(1)</script> &amp; **bold**',
    body: 'Line one\nLine two\n\n\n    indented line with trailing spaces    ',
    archived: false,
    createdAt: at('2026-06-01T00:00:00Z'),
    updatedAt: at('2026-06-01T00:00:00Z'),
  },
  {
    id: 'worstnote000005',
    title: 'Đặng Thị Ngọc Hân — 王秀英 — 👩🏽‍💻 Priya',
    body: 'x'.repeat(2000),
    archived: false,
    createdAt: at('2026-01-01T00:00:00Z'),
    updatedAt: at('2026-02-01T00:00:00Z'),
  },
];
