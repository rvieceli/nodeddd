import { DomainError } from "@domain/core/errors/core-error";

export class NotificationNotFound extends DomainError.NotFound {
  constructor() {
    super(NotificationNotFound.name, "Notification not found");
  }
}

export class ReadNotificationNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      NotificationNotFound.name,
      "You are not allowed to read this notification",
    );
  }
}
