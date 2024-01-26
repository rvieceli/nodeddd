import {
  type PrimitiveUniqueId,
  UniqueId,
} from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";

import { UseCase } from "@domain/core/use-cases/use-case";
import { Question } from "@domain/forum/enterprise/entities/question";

import { QuestionsRepository } from "../../repositories/questions.repository";

interface CreateQuestionUseCaseRequest {
  title: string;
  content: string;
  authorId: PrimitiveUniqueId;
}

interface Payload {
  question: Question;
}

type CreateQuestionUseCaseResponse = Result<Payload, never>;

export class CreateQuestionUseCase
  implements
    UseCase<CreateQuestionUseCaseRequest, CreateQuestionUseCaseResponse>
{
  constructor(private readonly _questionsRepository: QuestionsRepository) {}

  async execute({
    authorId,
    title,
    content,
  }: CreateQuestionUseCaseRequest): Promise<CreateQuestionUseCaseResponse> {
    const question = Question.create({
      authorId: UniqueId.create(authorId),
      title,
      content,
    });

    this._questionsRepository.create(question);

    return Result.ok({ question });
  }
}
