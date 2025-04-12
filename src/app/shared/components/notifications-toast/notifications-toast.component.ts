import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  NotificationService,
  Notification,
} from '../../services/notifications.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-notification-toast',
  template: '', // No template needed as we use MatSnackBar
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private seenNotificationIds: string[] = [];
  private readonly SEEN_NOTIFICATIONS_KEY = 'fixsell_seen_notifications';
  private readonly MAX_STORED_IDS = 100;
  private readonly NOTIFICATION_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  private audio: HTMLAudioElement;
  private notificationsEnabled = false; // Track if browser notifications are enabled

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    // Initialize the audio element with correct path
    this.audio = new Audio();
    this.audio.src = 'assets/audio/printer-notification.mp3';

    // Add an error handler for the audio element
    this.audio.onerror = (e) => {
      console.error('Audio error:', e);
      console.error('Audio error code:', this.audio.error?.code);
      console.error('Audio error message:', this.audio.error?.message);
    };

    this.audio.load();

    // Load seen notification IDs from storage
    this.loadSeenNotifications();

    // Check if browser notifications are already permitted
    this.checkNotificationPermission();
  }

  ngOnInit(): void {
    // Connect to the socket when the component initializes
    this.notificationService.connectSocket();

    // Subscribe to realtime notifications
    this.subscription.add(
      this.notificationService.notifications$.subscribe(
        (notifications: Notification[]) => {
          if (notifications && notifications.length > 0) {
            const latest = notifications[0];

            // Skip already read notifications
            if (latest.status === 'read') {
              return;
            }

            // Only show if it's a new notification (not in seen list)
            if (latest.id && !this.isNotificationSeen(latest)) {
              this.markNotificationAsSeen(latest.id);
              this.playNotificationSound();
              this.showToast(latest);
              this.showBrowserNotification(latest);
            }
          }
        },
      ),
    );

    // Load initial unread notifications
    this.notificationService.loadNotifications();
  }

  /**
   * Check if browser notifications are permitted and set the flag
   */
  private checkNotificationPermission(): void {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.notificationsEnabled = true;
    } else if (Notification.permission !== 'denied') {
      // We need to ask for permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.notificationsEnabled = true;
        }
      });
    }
  }

  /**
   * Show a browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    // Check if browser notifications are supported and enabled
    if (!this.notificationsEnabled || !('Notification' in window)) {
      return;
    }

    // If permission is granted, create and show the notification
    if (Notification.permission === 'granted') {
      const notificationType = this.getNotificationType(notification.type);

      // Create the notification
      const browserNotification = new Notification(
        'Fixsell - ' + notification.title,
        {
          body: notification.message,
          icon: '/assets/icons/favicon.png', // Path to your app icon
          badge: '/assets/icons/favicon.png', // Small icon for Android
          tag: notification.id, // Prevents duplicate notifications
          requireInteraction: false, // Auto close after a while
        },
      );

      // Add click handler to navigate when notification is clicked
      browserNotification.onclick = () => {
        window.focus(); // Focus the window

        // Mark as read and navigate
        this.notificationService.markAsRead(notification.id).subscribe(() => {
          if (notification.entityType === 'ticket') {
            this.router.navigate(['/support/tickets', notification.entityId]);
          } else if (notification.entityType === 'lead') {
            this.router.navigate(['/sales/leads', notification.entityId]);
          } else {
            this.router.navigate(['/dashboard/settings']);
          }
        });

        browserNotification.close();
      };
    } else if (Notification.permission !== 'denied') {
      // We need to ask for permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.notificationsEnabled = true;
          this.showBrowserNotification(notification);
        }
      });
    }
  }
  // Check if notification has been seen
  private isNotificationSeen(notification: Notification): boolean {
    // Check if the notification ID is in our seen list
    const isSeen = this.seenNotificationIds.includes(notification.id);

    // Check if the notification is older than our expiry time
    // This avoids showing very old notifications even if they weren't seen
    const isOld = this.isNotificationOld(notification);

    return isSeen || isOld;
  }

  // Check if a notification is older than our cutoff time
  private isNotificationOld(notification: Notification): boolean {
    const notificationDate = new Date(notification.createdAt).getTime();
    const now = Date.now();
    return now - notificationDate > this.NOTIFICATION_EXPIRY_TIME;
  }

  // Mark a notification as seen so it doesn't show again on refresh
  private markNotificationAsSeen(id: string): void {
    // Add to the front of the array (most recent first)
    this.seenNotificationIds.unshift(id);

    // Limit the size of the array to prevent it from growing too large
    if (this.seenNotificationIds.length > this.MAX_STORED_IDS) {
      this.seenNotificationIds = this.seenNotificationIds.slice(
        0,
        this.MAX_STORED_IDS,
      );
    }

    // Save to localStorage
    try {
      localStorage.setItem(
        this.SEEN_NOTIFICATIONS_KEY,
        JSON.stringify(this.seenNotificationIds),
      );
    } catch (e) {
      console.error('Error storing seen notifications:', e);
    }
  }

  // Load seen notification IDs from localStorage
  private loadSeenNotifications(): void {
    try {
      const stored = localStorage.getItem(this.SEEN_NOTIFICATIONS_KEY);
      if (stored) {
        this.seenNotificationIds = JSON.parse(stored);

        // Validate that the parsed result is actually an array
        if (!Array.isArray(this.seenNotificationIds)) {
          console.error('Stored notification IDs is not an array, resetting');
          this.seenNotificationIds = [];
        }
      }
    } catch (e) {
      console.error('Error loading seen notifications:', e);
      this.seenNotificationIds = [];
    }
  }

  // Method to play the notification sound
  playNotificationSound(): void {
    // Check if audio is properly loaded
    if (this.audio.readyState === 0) {
      console.warn('Audio not ready, reloading...');
      // Try to reload the audio
      this.audio.src = 'assets/audio/notification.mp3';
      this.audio.load();
    }

    // Reset the audio to the beginning in case it was already played
    this.audio.currentTime = 0;

    // Play the sound with better error handling
    this.audio
      .play()
      .then(() => {
        console.log('Notification sound played successfully');
      })
      .catch((error) => {
        // Handle any errors (e.g., browser restrictions on autoplay)
        console.error('Error playing notification sound:', error);

        // If it's a user interaction error, we might want to handle it differently
        if (error.name === 'NotAllowedError') {
          console.warn(
            'Audio playback was prevented due to lack of user interaction',
          );
        }
      });
  }

  showToast(notification: Notification): void {
    // Map notification type to icon and colors
    const notificationType = this.getNotificationType(notification.type);

    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: notification.title,
        message: notification.message,
        buttonText: 'Ver',
        buttonColor: notificationType.buttonColor,
        iconColor: notificationType.iconColor,
        borderColor: notificationType.borderColor,
        icon: notificationType.icon,
        action: () => this.handleNotificationAction(notification),
      },
      duration: 8000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [notificationType.toastClass],
    });
  }

  getNotificationType(type: string): any {
    // Map notification types to styling
    const typeMap: Record<string, any> = {
      ticket_created: {
        icon: 'confirmation_number',
        buttonColor: 'button-primary',
        iconColor: 'info-icon',
        borderColor: 'info-border',
        toastClass: 'info-toast',
      },
      ticket_updated: {
        icon: 'update',
        buttonColor: 'button-primary',
        iconColor: 'info-icon',
        borderColor: 'info-border',
        toastClass: 'info-toast',
      },
      ticket_assigned: {
        icon: 'assignment_ind',
        buttonColor: 'button-warning',
        iconColor: 'warning-icon',
        borderColor: 'warning-border',
        toastClass: 'warning-toast',
      },
      ticket_closed: {
        icon: 'task_alt',
        buttonColor: 'button-success',
        iconColor: 'success-icon',
        borderColor: 'success-border',
        toastClass: 'success-toast',
      },
      // Add lead notification types
      lead_created: {
        icon: 'person_add',
        buttonColor: 'button-primary',
        iconColor: 'info-icon',
        borderColor: 'info-border',
        toastClass: 'info-toast',
      },
      lead_assigned: {
        icon: 'assignment_ind',
        buttonColor: 'button-warning',
        iconColor: 'warning-icon',
        borderColor: 'warning-border',
        toastClass: 'warning-toast',
      },
      lead_updated: {
        icon: 'update',
        buttonColor: 'button-primary',
        iconColor: 'info-icon',
        borderColor: 'info-border',
        toastClass: 'info-toast',
      },
      // Default case handled in the return statement
    };

    // Default to info styling if type not found
    return (
      typeMap[type] || {
        icon: 'notifications',
        buttonColor: 'button-primary',
        iconColor: 'info-icon',
        borderColor: 'info-border',
        toastClass: 'info-toast',
      }
    );
  }

  handleNotificationAction(notification: Notification): void {
    // Mark as read
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      // Navigate based on notification type and entity
      if (notification.entityType === 'ticket') {
        this.router.navigate(['/support/tickets', notification.entityId]);
      } else if (notification.entityType === 'lead') {
        this.router.navigate(['/sales/leads', notification.entityId]);
      } else {
        // Default navigation to notifications list
        this.router.navigate(['/dashboard/settings']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
