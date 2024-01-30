import {
  type PrimitiveUniqueId,
  UniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Question } from "@domain/forum/enterprise/entities/question";
import { QuestionAttachment } from "@domain/forum/enterprise/entities/question-attachment";
import { QuestionAttachmentList } from "@domain/forum/enterprise/entities/question-attachment-list";
import { Text } from "@domain/forum/enterprise/entities/value-objects/text";

import { QuestionsRepository } from "../../repositories/questions.repository";

interface CreateQuestionUseCaseRequest {
  title: string;
  content: string;
  authorId: PrimitiveUniqueId;
  attachmentIds?: PrimitiveUniqueId[];
}

interface Payload {
  question: Question;
}

type CreateQuestionUseCaseResponse = Result<Payload, never>;

export class CreateQuestionUseCase
  implements
    UseCase<CreateQuestionUseCaseRequest, CreateQuestionUseCaseResponse>
{
  constructor(private readonly _questionsRepository: QuestionsRepository) {}

  async execute({
    authorId,
    title,
    content,
    attachmentIds,
  }: CreateQuestionUseCaseRequest): Promise<CreateQuestionUseCaseResponse> {
    const question = Question.create({
      authorId: UniqueId.create(authorId),
      title: Text.create(title),
      content: Text.create(content),
    });

    const attachments = attachmentIds?.map((id) =>
      QuestionAttachment.create({
        attachmentId: UniqueId.create(id),
        questionId: question.id,
      }),
    );

    question.attachments = new QuestionAttachmentList(attachments);

    this._questionsRepository.create(question);

    return Result.ok({ question });
  }
}
