import { PaginationPolicy } from "@domain/core/policies/pagination.policy";
import { Result } from "@domain/core/errors/result";
import { PaginatedResponse } from "@domain/core/repository/pagination";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Question } from "@domain/forum/enterprise/entities/question";

import { QuestionsRepository } from "../../repositories/questions.repository";

interface FetchRecentQuestionsRequest {
  page: number;
  pageSize: number;
}

type Payload = PaginatedResponse<Question>;

type FetchRecentQuestionsResponse = Result<Payload, never>;

export class FetchRecentQuestionsUseCase
  implements UseCase<FetchRecentQuestionsRequest, FetchRecentQuestionsResponse>
{
  constructor(private readonly _questionsRepository: QuestionsRepository) {}

  async execute({
    page,
    pageSize,
  }: FetchRecentQuestionsRequest): Promise<FetchRecentQuestionsResponse> {
    if (!PaginationPolicy.isAllowed(page, pageSize))
      throw new Error("Invalid pagination");

    const pagedItems = await this._questionsRepository.findManyRecent({
      page: page,
      pageSize: pageSize,
    });

    return Result.ok(pagedItems);
  }
}
