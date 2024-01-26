import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import type { RequireAtLeastOne } from "@domain/core/types/require-at-least-one";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Question } from "@domain/forum/enterprise/entities/question";

import {
  QuestionModificationNotAllowed,
  QuestionNotFound,
} from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";

interface ModifyQuestionUseCaseRequest {
  actorId: PrimitiveUniqueId;
  questionId: PrimitiveUniqueId;
  data: RequireAtLeastOne<{
    title: string;
    content: string;
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
  constructor(private readonly _questionsRepository: QuestionsRepository) {}

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

    if (data.title) question.title = data.title;
    if (data.content) question.content = data.content;

    await this._questionsRepository.save(question);

    return Result.ok({ question });
  }
}
