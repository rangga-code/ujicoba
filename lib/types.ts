export type MessageDirection = 'left' | 'right' | 'other' | 'self';

export interface MessageState {
  text: string;
  caption?: string;
  sender: string;
  timestamp: string;
  direction: MessageDirection;
  image?: string;
  imageUrl?: string;
  isRead: boolean;
  emojiStyle: 'apple' | 'google' | 'facebook';
}

export interface ChatConfig {
  background?: string;
  backgroundUrl?: string;
  battery: number;
  signalStrength: number; // 0-4
  wifi: boolean;
  carrier: string;
  time: string;
  isDark: boolean;
  isTyping: boolean;
  blurBackground: boolean;
  roundedBubble: boolean;
  canvasScale: number;
  preset: 'iMessage' | 'WhatsApp' | 'Telegram' | 'Instagram' | 'TikTok';
}

export interface HistoryItem {
  id: string;
  name: string;
  date: string;
  state: MessageState;
  config: ChatConfig;
  generatedImageUrl?: string;
}
