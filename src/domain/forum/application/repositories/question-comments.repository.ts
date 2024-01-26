import { Repository } from "@domain/core/repository/repository";

import { QuestionComment } from "@domain/forum/enterprise/entities/question-comment";
import {
  PaginatedRequest,
  PaginatedResponse,
} from "../../../core/repository/pagination";

export interface QuestionCommentsRepository extends Repository {
  create(comment: QuestionComment): Promise<void>;
  save(comment: QuestionComment): Promise<void>;
  delete(comment: QuestionComment): Promise<void>;
  findById(commentId: string): Promise<QuestionComment | undefined>;
  findManyByQuestionId(
    questionId: string,
    pagination: PaginatedRequest,
  ): Promise<PaginatedResponse<QuestionComment>>;
}
