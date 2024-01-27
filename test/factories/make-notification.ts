import { faker } from "@faker-js/faker";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  CreateNotificationProps,
  Notification,
} from "@domain/notification/enterprise/entities/notification";

export function makeNotification(
  override?: Partial<CreateNotificationProps>,
  id?: UniqueId,
) {
  return Notification.create(
    {
      recipientId: UniqueId.create(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      ...override,
    },
    id,
  );
}
