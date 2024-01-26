import { QuestionAttachment } from "@domain/forum/enterprise/entities/question-attachment";
import { InMemory } from "./in-memory";
import { QuestionAttachmentsRepository } from "@domain/forum/application/repositories/question-attachments.repository";

export class InMemoryQuestionAttachmentsRepository
  extends InMemory<QuestionAttachment>
  implements QuestionAttachmentsRepository
{
  clone(base: QuestionAttachment): QuestionAttachment {
    return QuestionAttachment.create(
      {
        attachmentId: base.attachmentId,
        questionId: base.questionId,
      },
      base.id,
    ); // should the id be kept?
  }

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    return this.store.filter((qa) => qa.questionId.equals(questionId));
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    this.store = this.store.filter((qa) => !qa.questionId.equals(questionId));
  }
}
