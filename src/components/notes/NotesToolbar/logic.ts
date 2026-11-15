'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Search and filter live in the URL so results are shareable and survive reloads. Both controls
 * update optimistically while the server renders the new results. When the URL changes from
 * elsewhere (clear-search link, back button) the controls adopt it, without overwriting text the
 * user typed after the last request.
 */
export function useNotesToolbar(initialSearch: string, initialArchived: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [archived, setArchivedState] = useState(initialArchived);
  const [requestedSearch, setRequestedSearch] = useState(initialSearch);
  const [rendered, setRendered] = useState({ search: initialSearch, archived: initialArchived });
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (rendered.search !== initialSearch || rendered.archived !== initialArchived) {
    setRendered({ search: initialSearch, archived: initialArchived });
    setArchivedState(initialArchived);
    if (initialSearch !== requestedSearch) {
      setSearch(initialSearch);
      setRequestedSearch(initialSearch);
    }
  }

  const navigate = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
      }
      params.delete('page');
      const query = params.toString();
      startTransition(() =>
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
      );
    },
    [pathname, router, searchParams],
  );

  const requestSearch = useCallback(
    (value: string) => {
      const next = value.trim();
      setRequestedSearch(next);
      navigate({ search: next || null });
    },
    [navigate],
  );

  const onSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => requestSearch(value), SEARCH_DEBOUNCE_MS);
    },
    [requestSearch],
  );

  const submitSearch = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    requestSearch(search);
  }, [requestSearch, search]);

  const setArchived = useCallback(
    (next: boolean) => {
      setArchivedState(next);
      navigate({ archived: next ? 'true' : null });
    },
    [navigate],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { search, onSearchChange, submitSearch, archived, setArchived, pending };
}
