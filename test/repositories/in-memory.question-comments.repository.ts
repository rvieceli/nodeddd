import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";

import { QuestionCommentsRepository } from "@domain/forum/application/repositories/question-comments.repository";
import { QuestionComment } from "@domain/forum/enterprise/entities/question-comment";

import { InMemory } from "./in-memory";

export class InMemoryQuestionCommentsRepository
  extends InMemory<QuestionComment>
  implements QuestionCommentsRepository
{
  clone(base: QuestionComment): QuestionComment {
    return QuestionComment.create(
      this.removeUndefined({
        questionId: base.questionId,
        authorId: base.authorId,
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
  ): Promise<PaginatedResponse<QuestionComment>> {
    const items = this.filter((answer) =>
      answer.questionId.equals(questionId),
    ).toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return this.paginate(items, pagination);
  }
}
