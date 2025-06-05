/**
 * Format a date to a human-readable distance from now
 * (e.g., "in 3 days", "2 months ago")
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = date.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInMilliseconds < 0) {
    // Date is in the past
    if (Math.abs(diffInMonths) > 0) {
      return `${Math.abs(diffInMonths)} month${Math.abs(diffInMonths) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffInDays) > 0) {
      return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffInHours) > 0) {
      return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffInMinutes) > 0) {
      return `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } else {
    // Date is in the future
    if (diffInMonths > 0) {
      return `in ${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`;
    } else if (diffInDays > 0) {
      return `in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
      return `in ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    } else {
      return 'Just now';
    }
  }
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}