import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";
import { Repository } from "@domain/core/repository/repository";

import { Answer } from "../../enterprise/entities/answer";

export interface AnswersRepository extends Repository {
  create(answer: Answer): Promise<void>;
  save(answer: Answer): Promise<void>;
  delete(answer: Answer): Promise<void>;
  findById(id: PrimitiveUniqueId): Promise<Answer | undefined>;
  findManyByQuestionId(
    id: PrimitiveUniqueId,
    pagination: PaginatedRequest,
  ): Promise<PaginatedResponse<Answer>>;
}
