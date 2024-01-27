import { Repository } from "@domain/core/repository/repository";

import { AnswerAttachment } from "@domain/forum/enterprise/entities/answer-attachment";

export interface AnswerAttachmentsRepository extends Repository {
  create(answerAttachment: AnswerAttachment): Promise<void>;
  createMany(answerAttachments: AnswerAttachment[]): Promise<void>;
  findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]>;
  deleteManyByAnswerId(answerId: string): Promise<void>;
  deleteManyByAttachmentIds(answerIds: string[]): Promise<void>;
}
