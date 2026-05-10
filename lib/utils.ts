import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function generateRandomStatus(): string {
  const statuses = [
    'Online',
    'last seen today at 10:45 AM',
    'Typing...',
    'last seen recently',
    'Hey there! I am using WhatsApp.',
    'Busy',
    'At the gym 🏋️‍♂️',
    'In a meeting 👨‍💻',
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}
