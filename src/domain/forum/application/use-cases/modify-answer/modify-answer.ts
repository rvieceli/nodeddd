import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import type { RequireAtLeastOne } from "@domain/core/types/require-at-least-one";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Answer } from "@domain/forum/enterprise/entities/answer";

import {
  AnswerNotFound,
  AnswerModificationNotAllowed,
} from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";

interface ModifyAnswerUseCaseRequest {
  actorId: PrimitiveUniqueId;
  answerId: PrimitiveUniqueId;
  data: RequireAtLeastOne<{
    content: string;
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
  constructor(private readonly _answersRepository: AnswersRepository) {}

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

    if (data.content) answer.content = data.content;

    await this._answersRepository.save(answer);

    return Result.ok({ answer });
  }
}
