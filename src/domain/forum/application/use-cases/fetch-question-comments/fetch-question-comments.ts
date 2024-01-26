import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { PaginationPolicy } from "@domain/core/policies/pagination.policy";
import { PaginatedResponse } from "@domain/core/repository/pagination";
import { UseCase } from "@domain/core/use-cases/use-case";

import { QuestionComment } from "@domain/forum/enterprise/entities/question-comment";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";

interface FetchQuestionCommentsRequest {
  questionId: PrimitiveUniqueId;
  page: number;
  pageSize: number;
}

type Payload = PaginatedResponse<QuestionComment>;

type FetchQuestionCommentsResponse = Result<Payload, never>;

export class FetchQuestionCommentsUseCase
  implements
    UseCase<FetchQuestionCommentsRequest, FetchQuestionCommentsResponse>
{
  constructor(
    private readonly _questionsCommentsRepository: QuestionCommentsRepository,
  ) {}

  async execute({
    questionId,
    page,
    pageSize,
  }: FetchQuestionCommentsRequest): Promise<FetchQuestionCommentsResponse> {
    if (!PaginationPolicy.isAllowed(page, pageSize))
      throw new Error("Invalid pagination");

    const pagedItems =
      await this._questionsCommentsRepository.findManyByQuestionId(questionId, {
        page: page,
        pageSize: pageSize,
      });

    return Result.ok(pagedItems);
  }
}
