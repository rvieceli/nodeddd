import {
  UniqueId,
  type PrimitiveUniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { QuestionComment } from "@domain/forum/enterprise/entities/question-comment";
import { Text } from "@domain/forum/enterprise/entities/value-objects/text";

import { QuestionNotFound } from "../../errors/questions.errors";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";

interface CommentOnQuestionUseCaseRequest {
  actorId: PrimitiveUniqueId;
  questionId: PrimitiveUniqueId;
  content: string;
}

interface Payload {
  comment: QuestionComment;
}

type CommentOnQuestionUseCaseResponse = Result<Payload, QuestionNotFound>;

export class CommentOnQuestionUseCase
  implements
    UseCase<CommentOnQuestionUseCaseRequest, CommentOnQuestionUseCaseResponse>
{
  constructor(
    private _questionsRepository: QuestionsRepository,
    private _questionCommentsRepository: QuestionCommentsRepository,
  ) {}

  async execute({
    actorId,
    questionId,
    content,
  }: CommentOnQuestionUseCaseRequest): Promise<CommentOnQuestionUseCaseResponse> {
    const question = await this._questionsRepository.findById(questionId);

    if (!question) {
      return Result.fail(new QuestionNotFound());
    }

    const comment = QuestionComment.create({
      questionId: question.id,
      authorId: UniqueId.create(actorId),
      content: Text.create(content),
    });

    await this._questionCommentsRepository.create(comment);

    return Result.ok({ comment });
  }
}
