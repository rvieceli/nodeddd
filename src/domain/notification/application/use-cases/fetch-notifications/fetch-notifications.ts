import { PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { PaginatedResponse } from "@domain/core/repository/pagination";
import { UseCase } from "@domain/core/use-cases/use-case";
import { Notification } from "@domain/notification/enterprise/entities/notification";
import { NotificationsRepository } from "../../repositories/notifications.repository";
import { PaginationPolicy } from "@domain/core/policies/pagination.policy";

interface FetchNotificationsUseCaseRequest {
  recipientId: PrimitiveUniqueId;
  page: number;
  pageSize: number;
}

type Payload = PaginatedResponse<Notification>;

type FetchNotificationsUseCaseResponse = Result<Payload, never>;

export class FetchNotificationsUseCase
  implements
    UseCase<
      FetchNotificationsUseCaseRequest,
      FetchNotificationsUseCaseResponse
    >
{
  constructor(
    private readonly _notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    recipientId,
    page,
    pageSize,
  }: FetchNotificationsUseCaseRequest): Promise<FetchNotificationsUseCaseResponse> {
    if (!PaginationPolicy.isAllowed(page, pageSize))
      throw new Error("Invalid pagination");

    const pagedItems =
      await this._notificationsRepository.findManyByRecipientId(recipientId, {
        page,
        pageSize,
      });

    return Result.ok(pagedItems);
  }
}
