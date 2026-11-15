export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * Compact page list with a constant length (`2 * siblings + 5`) so the control never jumps:
 * first, last, current and its neighbours, with ellipses for gaps.
 */
export function paginationRange(page: number, totalPages: number, siblings = 1): PaginationItem[] {
  if (totalPages <= 0) return [];
  const current = Math.min(Math.max(1, page), totalPages);
  const slots = siblings * 2 + 5;
  if (totalPages <= slots) return range(1, totalPages);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, totalPages);
  const showStartEllipsis = left > 2;
  const showEndEllipsis = right < totalPages - 1;
  const edgeCount = siblings * 2 + 3;

  if (!showStartEllipsis) return [...range(1, edgeCount), 'ellipsis-end', totalPages];
  if (!showEndEllipsis)
    return [1, 'ellipsis-start', ...range(totalPages - edgeCount + 1, totalPages)];
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', totalPages];
}
