export interface ChatItem {
    name: string;
    lastMessage: string;
    time: Date;
    status: 'online' | 'offline';
    unreadCount?: number;
    roomId: string;
}

export interface NewChatMessage {
    roomId: string;
    senderId: string;
    senderName: string | null;
    message: string;
    timestamp: Date;
    read: boolean;
}
export interface ChatMessage {
    id?: number;
    roomId: string;
    senderId?: string;
    senderName: string | null;
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface GroupedMessages {
    [roomId: string]: ChatMessage[];
}