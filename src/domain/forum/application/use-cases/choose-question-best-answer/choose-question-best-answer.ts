import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Question } from "@domain/forum/enterprise/entities/question";

import { AnswerNotFound } from "../../errors/answers.errors";
import {
  QuestionNotFound,
  QuestionModificationNotAllowed,
} from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";
import { AnswersRepository } from "../../repositories/answers.repository";

interface ChooseQuestionBestAnswerUseCaseRequest {
  actorId: PrimitiveUniqueId;
  answerId: PrimitiveUniqueId;
}

interface Payload {
  question: Question;
}

type ChooseQuestionBestAnswerUseCaseResponse = Result<
  Payload,
  AnswerNotFound | QuestionNotFound | QuestionModificationNotAllowed
>;

export class ChooseQuestionBestAnswerUseCase
  implements
    UseCase<
      ChooseQuestionBestAnswerUseCaseRequest,
      ChooseQuestionBestAnswerUseCaseResponse
    >
{
  constructor(
    private readonly _answersRepository: AnswersRepository,
    private readonly _questionsRepository: QuestionsRepository,
  ) {}

  async execute({
    actorId,
    answerId,
  }: ChooseQuestionBestAnswerUseCaseRequest): Promise<ChooseQuestionBestAnswerUseCaseResponse> {
    const answer = await this._answersRepository.findById(answerId);

    if (!answer) {
      return Result.fail(new AnswerNotFound());
    }

    const question = await this._questionsRepository.findById(
      answer.questionId.getId(),
    );

    if (!question) {
      return Result.fail(new QuestionNotFound());
    }

    if (!question.authorId.equals(actorId)) {
      return Result.fail(new QuestionModificationNotAllowed());
    }

    question.bestAnswerId = answer.id;

    await this._questionsRepository.save(question);

    return Result.ok({ question });
  }
}
