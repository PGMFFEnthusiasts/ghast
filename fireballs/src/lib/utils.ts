import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

dayjs.extend(relativeTime);

export { default as dayjs } from 'dayjs';
