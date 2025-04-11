import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: 'unread' | 'read';
  entityId: string;
  entityType: string;
  data: any;
  recipientId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = environment.baseUrl; // Use the environment configuration for the backend URL.
  private socket: Socket | undefined;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  // Add an observable for unread notifications count
  unreadCount$ = this.notifications$.pipe(
    map(
      (notifications) =>
        notifications.filter((n) => n.status === 'unread').length,
    ),
  );

  constructor(private http: HttpClient, private zone: NgZone) {
    // Socket initialization moved to connectSocket()
  }

  // Connect to the notifications WebSocket
  connectSocket(): void {
    if (!this.socket || !this.socket.connected) {
      console.log('Attempting to connect to socket server...');

      // Check if token exists and log it (partially)
      const token = localStorage.getItem('token');
      console.log(
        'Token available:',
        token ? `${token.substring(0, 10)}...` : 'No token found',
      );

      // Connect to the notifications namespace using the configured baseUrl.
      this.socket = io(`${this.baseUrl}/notifications`, {
        auth: {
          token: token || '', // Fix potential undefined
        },
        transports: ['websocket', 'polling'], // Try both connection types
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Add more detailed connection logging
      this.socket.on('connecting', () => {
        console.log('Socket attempting connection...');
      });

      // Setup connection event handlers
      this.socket.on('connect', () => {
        // Safely access this.socket.id after confirming socket exists
        console.log(
          'Socket connected successfully with ID:',
          this.socket?.id || 'unknown',
        );

        // Load initial notifications after successful connection
        this.loadNotifications();
      });

      this.socket.on('connect_error', (err: Error) => {
        console.error('Socket connection error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      });

      // Listen for realtime notification events.
      this.socket.on('notification', (notification: Notification) => {
        console.log('Notification received:', notification);
        this.zone.run(() => {
          const current = this.notificationsSubject.getValue();
          this.notificationsSubject.next([notification, ...current]);
        });
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected reason:', reason);

        // Fix TypeScript errors with optional chaining
        console.log('Was socket connected?', this.socket?.connected);
        console.log('Socket reconnecting?', this.socket?.disconnected);

        // If the server forcibly disconnected us, there might be an auth issue
        if (reason === 'io server disconnect') {
          console.error(
            'Server forcibly disconnected the socket - likely an authentication issue',
          );
        }
      });

      // Add extra error handlers
      this.socket.on('error', (error: Error) => {
        console.error('Socket general error:', error);
      });

      // Log reconnection attempts - fix io property access
      const socketIo = this.socket.io;
      socketIo.on('reconnect_attempt', (attemptNumber: number) => {
        console.log(`Socket reconnection attempt #${attemptNumber}`);
      });

      socketIo.on('reconnect_error', (error: Error) => {
        console.error('Socket reconnection error:', error);
      });

      socketIo.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after all attempts');
      });
    }
  }

  // Load initial notifications
  loadNotifications(): void {
    this.getNotifications().subscribe(
      (notifications) => {
        this.notificationsSubject.next(notifications);
      },
      (error) => {
        console.error('Error loading notifications:', error);
      },
    );
  }

  // Retrieve notifications via HTTP.
  getNotifications(status?: string): Observable<Notification[]> {
    let url = `${this.baseUrl}/notifications`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Notification[]>(url);
  }

  // Mark a single notification as read.
  markAsRead(notificationId: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/notifications/${notificationId}/read`, {})
      .pipe(
        map((response) => {
          // Update local state after marking as read
          const currentNotifications = this.notificationsSubject.getValue();
          const updatedNotifications = currentNotifications.map(
            (notification) =>
              notification.id === notificationId
                ? { ...notification, status: 'read' as 'read' }
                : notification,
          );
          this.notificationsSubject.next(updatedNotifications);
          return response;
        }),
      );
  }

  // Mark all notifications as read for the user.
  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/read-all`, {}).pipe(
      map((response) => {
        // Update local state after marking all as read
        const currentNotifications = this.notificationsSubject.getValue();
        const updatedNotifications = currentNotifications.map(
          (notification) => ({ ...notification, status: 'read' as 'read' }),
        );
        this.notificationsSubject.next(updatedNotifications);
        return response;
      }),
    );
  }

  // Disconnect the socket when necessary.
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
