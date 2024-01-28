import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";

import { Answer } from "@domain/forum/enterprise/entities/answer";
import { AnswerAttachmentList } from "@domain/forum/enterprise/entities/answer-attachment-list";

import { AnswersRepository } from "@domain/forum/application/repositories/answers.repository";
import { AnswerAttachmentsRepository } from "@domain/forum/application/repositories/answer-attachments.repository";

import { InMemory } from "./in-memory";
import { DomainEvents } from "@domain/core/events/domain-events";

export class InMemoryAnswersRepository
  extends InMemory<Answer>
  implements AnswersRepository
{
  constructor(
    private readonly _answerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {
    super();
  }

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

  async create(answer: Answer): Promise<void> {
    super.create(answer);

    if (answer.attachments) {
      await this.syncAttachments(answer.attachments);
    }

    DomainEvents.dispatchEventsFor(answer.id);
  }

  async save(saving: Answer): Promise<void> {
    await super.save(saving);

    if (saving.attachments) {
      await this.syncAttachments(saving.attachments);
    }
  }

  private async syncAttachments(attachmentList: AnswerAttachmentList) {
    await this._answerAttachmentsRepository.deleteManyByAttachmentIds(
      attachmentList.getRemovedItems().map((a) => a.attachmentId.getId()),
    );
    await this._answerAttachmentsRepository.createMany(
      attachmentList.getNewItems(),
    );
  }

  async delete(deleting: Answer): Promise<void> {
    super.delete(deleting);

    await this._answerAttachmentsRepository.deleteManyByAnswerId(
      deleting.getId(),
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
