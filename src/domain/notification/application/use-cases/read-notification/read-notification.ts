import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";
import {
  NotificationNotFound,
  ReadNotificationNotAllowed,
} from "../../errors/notification.errors";
import { NotificationsRepository } from "../../repositories/notifications.repository";

interface ReadNotificationUseCaseRequest {
  actorId: string;
  notificationId: string;
}

type ReadNotificationUseCaseResponse = Result<
  void,
  NotificationNotFound | ReadNotificationNotAllowed
>;

export class ReadNotificationUseCase
  implements
    UseCase<ReadNotificationUseCaseRequest, ReadNotificationUseCaseResponse>
{
  constructor(
    private readonly _notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    actorId,
    notificationId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const notification =
      await this._notificationsRepository.findById(notificationId);

    if (!notification) {
      return Result.fail(new NotificationNotFound());
    }

    if (!notification.recipientId.equals(actorId)) {
      return Result.fail(new ReadNotificationNotAllowed());
    }

    if (notification.readAt) {
      return Result.ok();
    }

    notification.read();

    await this._notificationsRepository.save(notification);

    return Result.ok();
  }
}
