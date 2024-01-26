import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import {
  AnswerNotFound,
  AnswerDeletionNotAllowed,
} from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";

interface DeleteAnswerUseCaseRequest {
  actorId: PrimitiveUniqueId;
  answerId: PrimitiveUniqueId;
}

type DeleteAnswerUseCaseResponse = Result<
  void,
  AnswerNotFound | AnswerDeletionNotAllowed
>;

export class DeleteAnswerUseCase
  implements UseCase<DeleteAnswerUseCaseRequest, DeleteAnswerUseCaseResponse>
{
  constructor(private readonly _answersRepository: AnswersRepository) {}

  async execute({
    answerId,
    actorId,
  }: DeleteAnswerUseCaseRequest): Promise<DeleteAnswerUseCaseResponse> {
    const answer = await this._answersRepository.findById(answerId);

    if (!answer) {
      return Result.fail(new AnswerNotFound());
    }

    if (!answer.authorId.equals(actorId)) {
      return Result.fail(new AnswerDeletionNotAllowed());
    }

    await this._answersRepository.delete(answer);

    return Result.ok();
  }
}
