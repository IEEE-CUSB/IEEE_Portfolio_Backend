import { Transform } from 'class-transformer';

// Trims and lowercases an email before validation runs.
export const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
