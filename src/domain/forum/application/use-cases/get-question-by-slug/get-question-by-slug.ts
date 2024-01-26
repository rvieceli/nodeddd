import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import { Question } from "@domain/forum/enterprise/entities/question";

import { QuestionNotFound } from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";

interface GetQuestionBySlugUseCaseRequest {
  slug: string;
}

interface Payload {
  question: Question;
}

type GetQuestionBySlugUseCaseResponse = Result<Payload, QuestionNotFound>;

export class GetQuestionBySlugUseCase
  implements
    UseCase<GetQuestionBySlugUseCaseRequest, GetQuestionBySlugUseCaseResponse>
{
  constructor(private readonly _questionsRepository: QuestionsRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseRequest): Promise<GetQuestionBySlugUseCaseResponse> {
    const question = await this._questionsRepository.findBySlug(slug);

    if (!question) {
      return Result.fail(new QuestionNotFound());
    }

    return Result.ok({ question });
  }
}
