import { Notification } from "@domain/notification/enterprise/entities/notification";

import { NotificationsRepository } from "@domain/notification/application/repositories/notifications.repository";

import { InMemory } from "./in-memory";

export class InMemoryNotificationsRepository
  extends InMemory<Notification>
  implements NotificationsRepository
{
  clone(base: Notification): Notification {
    return Notification.create(
      {
        recipientId: base.recipientId,
        title: base.title,
        content: base.content,
        createdAt: base.createdAt,
        readAt: base.readAt,
      },
      base.id,
    );
  }
}
