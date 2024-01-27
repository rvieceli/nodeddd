import { AnswerAttachment } from "@domain/forum/enterprise/entities/answer-attachment";
import { InMemory } from "./in-memory";
import { AnswerAttachmentsRepository } from "@domain/forum/application/repositories/answer-attachments.repository";

export class InMemoryAnswerAttachmentsRepository
  extends InMemory<AnswerAttachment>
  implements AnswerAttachmentsRepository
{
  clone(base: AnswerAttachment): AnswerAttachment {
    return AnswerAttachment.create(
      {
        attachmentId: base.attachmentId,
        answerId: base.answerId,
      },
      base.id,
    ); // should the id be kept?
  }

  async createMany(answerAttachments: AnswerAttachment[]): Promise<void> {
    await Promise.all(answerAttachments.map(this.save));
  }

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    return this.store.filter((qa) => qa.answerId.equals(answerId));
  }

  async deleteManyByAnswerId(answerId: string): Promise<void> {
    this.store = this.store.filter((qa) => !qa.answerId.equals(answerId));
  }

  async deleteManyByAttachmentIds(answerIds: string[]): Promise<void> {
    this.store = this.store.filter(
      (aa) => !answerIds.includes(aa.attachmentId.getId()),
    );
  }
}
