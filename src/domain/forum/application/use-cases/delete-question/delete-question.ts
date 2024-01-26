import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import {
  QuestionDeletionNotAllowed,
  QuestionNotFound,
} from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";

interface DeleteQuestionUseCaseRequest {
  actorId: PrimitiveUniqueId;
  questionId: PrimitiveUniqueId;
}

type DeleteQuestionUseCaseResponse = Result<
  void,
  QuestionNotFound | QuestionDeletionNotAllowed
>;

export class DeleteQuestionUseCase
  implements
    UseCase<DeleteQuestionUseCaseRequest, DeleteQuestionUseCaseResponse>
{
  constructor(private readonly _questionsRepository: QuestionsRepository) {}

  async execute({
    questionId,
    actorId,
  }: DeleteQuestionUseCaseRequest): Promise<DeleteQuestionUseCaseResponse> {
    const question = await this._questionsRepository.findById(questionId);

    if (!question) {
      return Result.fail(new QuestionNotFound());
    }

    if (!question.authorId.equals(actorId)) {
      return Result.fail(new QuestionDeletionNotAllowed());
    }

    await this._questionsRepository.delete(question);

    return Result.ok();
  }
}
