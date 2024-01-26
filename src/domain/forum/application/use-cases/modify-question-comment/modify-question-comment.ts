import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import type { RequireAtLeastOne } from "@domain/core/types/require-at-least-one";
import { UseCase } from "@domain/core/use-cases/use-case";

import { QuestionComment } from "@domain/forum/enterprise/entities/question-comment";

import {
  QuestionCommentModificationNotAllowed,
  QuestionCommentNotFound,
} from "../../errors/question-comment.errors";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";

interface ModifyQuestionCommentUseCaseRequest {
  actorId: PrimitiveUniqueId;
  commentId: PrimitiveUniqueId;
  data: RequireAtLeastOne<{
    content: string;
  }>;
}

interface Payload {
  comment: QuestionComment;
}

type ModifyQuestionCommentUseCaseResponse = Result<
  Payload,
  QuestionCommentNotFound | QuestionCommentModificationNotAllowed
>;

export class ModifyQuestionCommentUseCase
  implements
    UseCase<
      ModifyQuestionCommentUseCaseRequest,
      ModifyQuestionCommentUseCaseResponse
    >
{
  constructor(
    private readonly _commentsRepository: QuestionCommentsRepository,
  ) {}

  async execute({
    actorId,
    commentId,
    data,
  }: ModifyQuestionCommentUseCaseRequest): Promise<ModifyQuestionCommentUseCaseResponse> {
    const comment = await this._commentsRepository.findById(commentId);

    if (!comment) {
      return Result.fail(new QuestionCommentNotFound());
    }

    if (!comment.authorId.equals(actorId)) {
      return Result.fail(new QuestionCommentModificationNotAllowed());
    }

    if (data.content) comment.content = data.content;

    await this._commentsRepository.save(comment);

    return Result.ok({ comment });
  }
}
