import {
  UniqueId,
  type PrimitiveUniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { AnswerComment } from "@domain/forum/enterprise/entities/answer-comment";
import { Text } from "@domain/forum/enterprise/entities/value-objects/text";

import { AnswerNotFound } from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

interface CommentOnAnswerUseCaseRequest {
  actorId: PrimitiveUniqueId;
  answerId: PrimitiveUniqueId;
  content: string;
}

interface Payload {
  comment: AnswerComment;
}

type CommentOnAnswerUseCaseResponse = Result<Payload, AnswerNotFound>;

export class CommentOnAnswerUseCase
  implements
    UseCase<CommentOnAnswerUseCaseRequest, CommentOnAnswerUseCaseResponse>
{
  constructor(
    private _answersRepository: AnswersRepository,
    private _answerCommentsRepository: AnswerCommentsRepository,
  ) {}

  async execute({
    actorId,
    answerId,
    content,
  }: CommentOnAnswerUseCaseRequest): Promise<CommentOnAnswerUseCaseResponse> {
    const answer = await this._answersRepository.findById(answerId);

    if (!answer) {
      return Result.fail(new AnswerNotFound());
    }

    const comment = AnswerComment.create({
      answerId: answer.id,
      authorId: UniqueId.create(actorId),
      content: Text.create(content),
    });

    await this._answerCommentsRepository.create(comment);

    return Result.ok({ comment });
  }
}
