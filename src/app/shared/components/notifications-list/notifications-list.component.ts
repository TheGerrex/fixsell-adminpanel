import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {
  NotificationService,
  Notification,
} from 'src/app/shared/services/notifications.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
})
export class NotificationsListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Retrieve notifications from the backend via HTTP.
    this.subscriptions.add(
      this.notificationService.getNotifications().subscribe((notifications) => {
        this.notifications = notifications;
      }),
    );

    // Subscribe to realtime notifications via the BehaviorSubject.
    this.subscriptions.add(
      this.notificationService.notifications$.subscribe(
        (realtimeNotifications) => {
          // This example simply overrides the list with realtime notifications.
          // Adjust merging logic as needed.
          this.notifications = realtimeNotifications;
        },
      ),
    );
  }

  markAsRead(notification: Notification, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent navigation when clicking the mark as read button
    }

    this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.status = 'read';
    });
  }

  markAllAsRead(): void {
    // You'll need to implement this in your notification service
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach((notification) => {
        notification.status = 'read';
      });
    });
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(
      (notification) => notification.status === 'unread',
    );
  }

  getNotificationTypeClass(type: string): string {
    switch (type) {
      case 'ticket_created':
        return 'ticket-created';
      case 'ticket_updated':
        return 'ticket-updated';
      case 'ticket_assigned':
        return 'ticket-assigned';
      case 'ticket_closed':
        return 'ticket-closed';
      default:
        return 'default';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ticket_created':
        return 'confirmation_number';
      case 'ticket_updated':
        return 'update';
      case 'ticket_assigned':
        return 'assignment_ind';
      case 'ticket_closed':
        return 'task_alt';
      default:
        return 'notifications';
    }
  }

  navigateToEntity(notification: Notification): void {
    this.markAsRead(notification);

    // Navigate to the appropriate page based on the notification type
    if (notification.entityType === 'ticket') {
      this.router.navigate(['/support/tickets', notification.entityId]);
    } else if (notification.entityType === 'lead') {
      this.router.navigate(['/sales/leads', notification.entityId]);
    }
    // Add more entity types as needed
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
