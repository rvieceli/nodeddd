import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";

import { AnswersRepository } from "@domain/forum/application/repositories/answers.repository";
import { Answer } from "@domain/forum/enterprise/entities/answer";

import { InMemory } from "./in-memory";

export class InMemoryAnswersRepository
  extends InMemory<Answer>
  implements AnswersRepository
{
  clone(base: Answer) {
    return Answer.create(
      this.removeUndefined({
        authorId: base.authorId,
        questionId: base.questionId,
        content: base.content,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      }),
      base.id,
    );
  }

  async findManyByQuestionId(
    questionId: string,
    pagination: PaginatedRequest,
  ): Promise<PaginatedResponse<Answer>> {
    const items = this.filter((answer) =>
      answer.questionId.equals(questionId),
    ).toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return this.paginate(items, pagination);
  }
}
