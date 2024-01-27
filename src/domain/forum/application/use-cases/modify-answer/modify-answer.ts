import {
  UniqueId,
  type PrimitiveUniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import type { RequireAtLeastOne } from "@domain/core/types/require-at-least-one";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Answer } from "@domain/forum/enterprise/entities/answer";
import { AnswerAttachment } from "@domain/forum/enterprise/entities/answer-attachment";
import { AnswerAttachmentList } from "@domain/forum/enterprise/entities/answer-attachment-list";

import {
  AnswerNotFound,
  AnswerModificationNotAllowed,
} from "../../errors/answers.errors";

import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";
import { AnswersRepository } from "../../repositories/answers.repository";

interface ModifyAnswerUseCaseRequest {
  actorId: PrimitiveUniqueId;
  answerId: PrimitiveUniqueId;
  data: RequireAtLeastOne<{
    content?: string;
    attachmentIds?: PrimitiveUniqueId[];
  }>;
}

interface Payload {
  answer: Answer;
}

type ModifyAnswerUseCaseResponse = Result<
  Payload,
  AnswerNotFound | AnswerModificationNotAllowed
>;

export class ModifyAnswerUseCase
  implements UseCase<ModifyAnswerUseCaseRequest, ModifyAnswerUseCaseResponse>
{
  constructor(
    private readonly _answersRepository: AnswersRepository,
    private readonly _answerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

  async execute({
    actorId,
    answerId,
    data,
  }: ModifyAnswerUseCaseRequest): Promise<ModifyAnswerUseCaseResponse> {
    const answer = await this._answersRepository.findById(answerId);

    if (!answer) {
      return Result.fail(new AnswerNotFound());
    }

    if (!answer.authorId.equals(actorId)) {
      return Result.fail(new AnswerModificationNotAllowed());
    }

    const { content, attachmentIds } = data;

    if (content) answer.content = content;

    if (attachmentIds) {
      const currentAttachments =
        await this._answerAttachmentsRepository.findManyByAnswerId(answerId);

      const upcomingAttachments = attachmentIds.map((id) =>
        AnswerAttachment.create({
          attachmentId: UniqueId.create(id),
          answerId: answer.id,
        }),
      );

      answer.attachments = new AnswerAttachmentList(currentAttachments);
      answer.attachments.update(upcomingAttachments);
    }

    await this._answersRepository.save(answer);

    return Result.ok({ answer });
  }
}
