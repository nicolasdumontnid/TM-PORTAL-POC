export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  isOnline: boolean;
  isUnread: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isFromCurrentUser: boolean;
}

export interface ChatConversation {
  contactId: string;
  messages: ChatMessage[];
}