import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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

  constructor(private notificationService: NotificationService) {}

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

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.status = 'read';
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
