export const throttle = (
  func: (...args: unknown[]) => void,
  limit: number,
): ((...args: unknown[]) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function (this: unknown, ...args: unknown[]) {
    if (lastRan === null) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (lastFunc !== null) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(
        () => {
          if (Date.now() - (lastRan as number) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - (lastRan as number)),
      );
    }
  };
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function getInitials(name: string | null | undefined, count?: number): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase());

  return count && count > 0 ? initials.slice(0, count).join('') : initials.join('');
}

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  if (baseUrl && baseUrl !== '/') {
    return process.env.NEXT_PUBLIC_BASE_PATH + pathname;
  } else {
    return pathname;
  }
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600)
    return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 604800)
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  if (diff < 31536000)
    return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;

  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
}

export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(input: string) {
  const [hour, minute] = input?.split(':').map(Number);

  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function formatDateTimeUS(input: Date | string | number): string {
  const date = new Date(input);

  return date.toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export function formatDateUS(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateMonthUS(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export const getCurrencySymbol = () => {
  return '£';
};
export const getCurrencySymbolForTableHeader = (label: any) => {
  return `${label} (${getCurrencySymbol()})`;
};

export const formatDateLocal = (date: Date) => date?.toLocaleDateString('en-CA'); // YYYY-MM-DD

export const getDateRange = (key: string) => {
  if (key === 'all') {
    return {};
  }

  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  switch (key) {
    case 'today':
      startDate = new Date(now);
      endDate = new Date(now);
      break;

    case 'yesterday':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      endDate = new Date(startDate);
      break;

    case 'this_week': {
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diff = day === 0 ? 6 : day - 1; // week starts Monday

      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      endDate = new Date(now);
      break;
    }

    case 'last_week': {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;

      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff - 7);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    }

    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now);
      break;

    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;

    case 'Year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now);
      break;

    default:
      return {};
  }

  return {
    startDate: formatDateLocal(startDate),
    endDate: formatDateLocal(endDate),
  };
};

export function getRoundedMax(value: number) {
  if (value <= 1000) return 1000;
  return Math.ceil(value / 500) * 500;
}

export function getDateDifferenceBucket(date: string | Date): number {
  const today = new Date();
  const target = new Date(date);

  // Normalize both dates to midnight
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
export const formatDuration = (timeString: string) => {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':').map(Number);

  let result = '';

  if (hours > 0) {
    result += `${hours} hr${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    result += `${hours > 0 ? ' ' : ''}${minutes} min${minutes > 1 ? 's' : ''}`;
  }

  return result;
};

export const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-CA');
};

export const getErrorMessage = (response: any) => {
  if (response?.statusText !== 'Unauthorized') {
    return response?.statusText || 'Something went wrong';
  }
};
export const getRandomCreditId = () => {
  const randomNumber = Math.floor(Math.random() * 900) + 100;
  return `CRD-${randomNumber}`;
};

export const formatDateFromDateRangePicker = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
export const formatLabel = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
export function getContrastColor(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map((x) => x + x)
      .join('');
  if (c.length !== 6) return '#1f1f1f'; // fallback for invalid value

  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);

  // perceived brightness (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1f1f1f' : '#ffffff';
}
