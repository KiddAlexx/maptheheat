import { format, parseISO } from 'date-fns';

interface FormatSubmittedDateOptions {
  includeTime?: boolean;
}

export function formatSubmittedDate(
  createdAt: string,
  { includeTime = false }: FormatSubmittedDateOptions = {}
) {
  const pattern = includeTime ? 'dd MMM yyyy HH:mm' : 'dd MMM yyyy';
  return format(parseISO(createdAt), pattern);
}
