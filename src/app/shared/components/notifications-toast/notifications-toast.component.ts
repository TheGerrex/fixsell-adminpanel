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

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

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
              this.showToast(latest);
            }
          }
        },
      ),
    );

    // Load initial unread notifications
    this.notificationService.loadNotifications();
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
