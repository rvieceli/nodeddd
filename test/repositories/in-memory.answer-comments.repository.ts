import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";
import { DomainEvents } from "@domain/core/events/domain-events";

import { AnswerCommentsRepository } from "@domain/forum/application/repositories/answer-comments.repository";
import { AnswerComment } from "@domain/forum/enterprise/entities/answer-comment";

import { InMemory } from "./in-memory";

export class InMemoryAnswerCommentsRepository
  extends InMemory<AnswerComment>
  implements AnswerCommentsRepository
{
  clone(base: AnswerComment): AnswerComment {
    return AnswerComment.create(
      this.removeUndefined({
        answerId: base.answerId,
        authorId: base.authorId,
        content: base.content,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      }),
      base.id,
    );
  }

  async create(creating: AnswerComment): Promise<void> {
    await super.create(creating);

    DomainEvents.dispatchEventsFor(creating.id);
  }

  async findManyByAnswerId(
    answerId: string,
    pagination: PaginatedRequest,
  ): Promise<PaginatedResponse<AnswerComment>> {
    const items = this.filter((answer) =>
      answer.answerId.equals(answerId),
    ).toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return this.paginate(items, pagination);
  }
}
