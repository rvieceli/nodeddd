import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";
import { Repository } from "@domain/core/repository/repository";

import { AnswerComment } from "@domain/forum/enterprise/entities/answer-comment";

export interface AnswerCommentsRepository extends Repository {
  create(comment: AnswerComment): Promise<void>;
  save(comment: AnswerComment): Promise<void>;
  delete(comment: AnswerComment): Promise<void>;
  findById(id: PrimitiveUniqueId): Promise<AnswerComment | undefined>;
  findManyByAnswerId(
    questionId: string,
    params: PaginatedRequest,
  ): Promise<PaginatedResponse<AnswerComment>>;
}
