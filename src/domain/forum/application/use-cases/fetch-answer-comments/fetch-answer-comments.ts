import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { PaginationPolicy } from "@domain/core/policies/pagination.policy";
import { PaginatedResponse } from "@domain/core/repository/pagination";
import { UseCase } from "@domain/core/use-cases/use-case";

import { AnswerComment } from "@domain/forum/enterprise/entities/answer-comment";

import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

interface FetchAnswerCommentsRequest {
  answerId: PrimitiveUniqueId;
  page: number;
  pageSize: number;
}

type Payload = PaginatedResponse<AnswerComment>;

type FetchAnswerCommentsResponse = Result<Payload, never>;

export class FetchAnswerCommentsUseCase
  implements UseCase<FetchAnswerCommentsRequest, FetchAnswerCommentsResponse>
{
  constructor(
    private readonly _answersCommentsRepository: AnswerCommentsRepository,
  ) {}

  async execute({
    answerId,
    page,
    pageSize,
  }: FetchAnswerCommentsRequest): Promise<FetchAnswerCommentsResponse> {
    if (!PaginationPolicy.isAllowed(page, pageSize))
      throw new Error("Invalid pagination");

    const pagedItems = await this._answersCommentsRepository.findManyByAnswerId(
      answerId,
      {
        page: page,
        pageSize: pageSize,
      },
    );

    return Result.ok(pagedItems);
  }
}
