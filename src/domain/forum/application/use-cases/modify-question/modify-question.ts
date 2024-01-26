import {
  UniqueId,
  type PrimitiveUniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import type { RequireAtLeastOne } from "@domain/core/types/require-at-least-one";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Question } from "@domain/forum/enterprise/entities/question";

import {
  QuestionModificationNotAllowed,
  QuestionNotFound,
} from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";
import { QuestionAttachmentList } from "@domain/forum/enterprise/entities/question-attachment-list";
import { QuestionAttachment } from "@domain/forum/enterprise/entities/question-attachment";

interface ModifyQuestionUseCaseRequest {
  actorId: PrimitiveUniqueId;
  questionId: PrimitiveUniqueId;
  data: RequireAtLeastOne<{
    title: string;
    content: string;
    attachmentIds?: PrimitiveUniqueId[];
  }>;
}

interface Payload {
  question: Question;
}

type ModifyQuestionUseCaseResponse = Result<
  Payload,
  QuestionNotFound | QuestionModificationNotAllowed
>;

export class ModifyQuestionUseCase
  implements
    UseCase<ModifyQuestionUseCaseRequest, ModifyQuestionUseCaseResponse>
{
  constructor(
    private readonly _questionsRepository: QuestionsRepository,
    private readonly _questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async execute({
    actorId,
    questionId,
    data,
  }: ModifyQuestionUseCaseRequest): Promise<ModifyQuestionUseCaseResponse> {
    const question = await this._questionsRepository.findById(questionId);

    if (!question) {
      return Result.fail(new QuestionNotFound());
    }

    if (!question.authorId.equals(actorId)) {
      return Result.fail(new QuestionModificationNotAllowed());
    }

    const { title, content, attachmentIds } = data;

    if (title) question.title = title;
    if (content) question.content = content;

    if (attachmentIds) {
      const currentAttachments =
        await this._questionAttachmentsRepository.findManyByQuestionId(
          questionId,
        );

      const upcomingAttachments = attachmentIds.map((id) =>
        QuestionAttachment.create({
          attachmentId: UniqueId.create(id),
          questionId: question.id,
        }),
      );

      question.attachments = new QuestionAttachmentList(currentAttachments);
      question.attachments.update(upcomingAttachments);
    }

    await this._questionsRepository.save(question);

    return Result.ok({ question });
  }
}
