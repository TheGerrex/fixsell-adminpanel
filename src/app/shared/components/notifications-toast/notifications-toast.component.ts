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
  private lastNotificationId: string | null = null;
  private audio: HTMLAudioElement;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    // Initialize the audio element with correct path
    this.audio = new Audio();
    this.audio.src = 'assets/audio/printer-notification.mp3'; // Fixed typo in filename

    // Add an error handler for the audio element
    this.audio.onerror = (e) => {
      console.error('Audio error:', e);
      console.error('Audio error code:', this.audio.error?.code);
      console.error('Audio error message:', this.audio.error?.message);
    };

    this.audio.load();
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
            // Only show the toast if this is a new notification
            if (latest.id !== this.lastNotificationId) {
              this.lastNotificationId = latest.id;
              this.playNotificationSound();
              this.showToast(latest);
            }
          }
        },
      ),
    );

    // Load initial unread notifications
    this.notificationService.loadNotifications();
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
