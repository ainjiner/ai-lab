export function timeAgo(dateInput: string | Date | number): string {
  if (!dateInput) return "—";
  
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 30) return "Just now";
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval === 1 ? "Yesterday" : `${interval} days ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval === 1 ? "1 min ago" : `${interval} mins ago`;
  
  return `${Math.floor(seconds)} secs ago`;
}

export function formatExact(dateInput: string | Date | number): string {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}