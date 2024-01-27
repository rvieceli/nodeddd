import { PrimitiveUniqueId, UniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Notification } from "@domain/notification/enterprise/entities/notification";

import { NotificationsRepository } from "../../repositories/notifications.repository";

interface SendNotificationUseCaseRequest {
  recipientId: PrimitiveUniqueId;
  title: string;
  content: string;
}

interface Payload {
  notification: Notification;
}

type SendNotificationUseCaseResponse = Result<Payload, never>;

export class SendNotificationUseCase
  implements
    UseCase<SendNotificationUseCaseRequest, SendNotificationUseCaseResponse>
{
  constructor(
    private readonly _notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    recipientId,
    title,
    content,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: UniqueId.create(recipientId),
      title,
      content,
    });

    await this._notificationsRepository.create(notification);

    return Result.ok({ notification });
  }
}
