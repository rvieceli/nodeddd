import { Repository } from "@domain/core/repository/repository";

import { QuestionAttachment } from "@domain/forum/enterprise/entities/question-attachment";

export interface QuestionAttachmentsRepository extends Repository {
  create(questionAttachment: QuestionAttachment): Promise<void>;
  findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]>;
  deleteManyByQuestionId(questionId: string): Promise<void>;
}
