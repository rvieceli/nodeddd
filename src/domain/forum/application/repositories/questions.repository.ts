import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";
import { Repository } from "@domain/core/repository/repository";

import { Question } from "../../enterprise/entities/question";

export interface QuestionsRepository extends Repository {
  create(question: Question): Promise<void>;
  save(question: Question): Promise<void>;
  delete(question: Question): Promise<void>;
  findBySlug(slug: string): Promise<Question | undefined>;
  findById(id: PrimitiveUniqueId): Promise<Question | undefined>;
  findManyRecent(
    params: PaginatedRequest,
  ): Promise<PaginatedResponse<Question>>;
}
