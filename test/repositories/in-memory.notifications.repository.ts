import { Notification } from "@domain/notification/enterprise/entities/notification";

import { NotificationsRepository } from "@domain/notification/application/repositories/notifications.repository";

import { InMemory } from "./in-memory";
import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";

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

  async findManyByRecipientId(
    recipientId: string,
    pagination: PaginatedRequest,
  ): Promise<PaginatedResponse<Notification>> {
    const items = this.store
      .filter((item) => item.recipientId.equals(recipientId))
      .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return this.paginate(items, pagination);
  }
}
