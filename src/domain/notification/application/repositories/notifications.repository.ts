import { Repository } from "@domain/core/repository/repository";

import { Notification } from "@domain/notification/enterprise/entities/notification";

export interface NotificationsRepository extends Repository {
  create(notification: Notification): Promise<void>;
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | undefined>;
}
