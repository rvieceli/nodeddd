import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { PaginationPolicy } from "@domain/core/policies/pagination.policy";
import { PaginatedResponse } from "@domain/core/repository/pagination";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Answer } from "@domain/forum/enterprise/entities/answer";

import { AnswersRepository } from "../../repositories/answers.repository";

interface FetchQuestionAnswersRequest {
  questionId: PrimitiveUniqueId;
  page: number;
  pageSize: number;
}

type Payload = PaginatedResponse<Answer>;

type FetchQuestionAnswersResponse = Result<Payload, never>;

export class FetchQuestionAnswersUseCase
  implements UseCase<FetchQuestionAnswersRequest, FetchQuestionAnswersResponse>
{
  constructor(private readonly _answersRepository: AnswersRepository) {}

  async execute({
    questionId,
    page,
    pageSize,
  }: FetchQuestionAnswersRequest): Promise<FetchQuestionAnswersResponse> {
    if (!PaginationPolicy.isAllowed(page, pageSize))
      throw new Error("Invalid pagination");

    const pagedItems = await this._answersRepository.findManyByQuestionId(
      questionId,
      {
        page: page,
        pageSize: pageSize,
      },
    );

    return Result.ok(pagedItems);
  }
}
