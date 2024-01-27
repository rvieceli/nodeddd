import { Entity } from "@domain/core/entities/entity";
import { UniqueId } from "@domain/core/entities/unique-id";
import { Optional } from "@domain/core/types/optional";

interface NotificationProps {
  recipientId: UniqueId;
  title: string;
  content: string;
  readAt?: Date;
  createdAt: Date;
}

export type CreateNotificationProps = Optional<NotificationProps, "createdAt">;

export class Notification extends Entity<NotificationProps> {
  static create(props: CreateNotificationProps, id?: UniqueId): Notification {
    return new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  get recipientId() {
    return this.props.recipientId;
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get readAt(): Date | undefined {
    return this.props.readAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  read() {
    if (this.props.readAt) return;

    this.props.readAt = new Date();
  }
}
