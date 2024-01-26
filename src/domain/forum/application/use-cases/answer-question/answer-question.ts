import {
  type PrimitiveUniqueId,
  UniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Answer } from "@domain/forum/enterprise/entities/answer";

import { AnswersRepository } from "../../repositories/answers.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionNotFound } from "../../errors/questions.errors";

interface AnswerQuestionRequest {
  questionId: PrimitiveUniqueId;
  actorId: PrimitiveUniqueId;
  content: string;
}

interface Payload {
  answer: Answer;
}

type AnswerQuestionResponse = Result<Payload, QuestionNotFound>;

export class AnswerQuestionUseCase
  implements UseCase<AnswerQuestionRequest, AnswerQuestionResponse>
{
  constructor(
    private readonly _answersRepository: AnswersRepository,
    private readonly _questionsRepository: QuestionsRepository,
  ) {}

  async execute({
    actorId,
    questionId,
    content,
  }: AnswerQuestionRequest): Promise<AnswerQuestionResponse> {
    const question = await this._questionsRepository.findById(questionId);

    if (!question) {
      return Result.fail(new QuestionNotFound());
    }

    const answer = Answer.create({
      content,
      questionId: question.id,
      authorId: UniqueId.create(actorId),
    });

    await this._answersRepository.create(answer);

    return Result.ok({ answer });
  }
}
