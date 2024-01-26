import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";

import { QuestionsRepository } from "@domain/forum/application/repositories/questions.repository";
import { Question } from "@domain/forum/enterprise/entities/question";

import { InMemory } from "./in-memory";
import { QuestionAttachmentsRepository } from "@domain/forum/application/repositories/question-attachments.repository";

export class InMemoryQuestionsRepository
  extends InMemory<Question>
  implements QuestionsRepository
{
  constructor(
    private readonly _questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {
    super();
  }

  clone(base: Question) {
    return Question.create(
      this.removeUndefined({
        authorId: base.authorId,
        content: base.content,
        title: base.title,
        slug: base.slug,
        bestAnswerId: base.bestAnswerId,
        attachments: base.attachments,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      }),
      base.id,
    );
  }

  async delete(deleting: Question): Promise<void> {
    super.delete(deleting);

    await this._questionAttachmentsRepository.deleteManyByQuestionId(
      deleting.getId(),
    );
  }

  async findBySlug(slug: string): Promise<Question | undefined> {
    return this.find((question) => question.slug.equals(slug));
  }

  async findManyRecent({
    page,
    pageSize,
  }: PaginatedRequest): Promise<PaginatedResponse<Question>> {
    const sortedItems = this.store.toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return this.paginate(sortedItems, { page, pageSize });
  }
}
