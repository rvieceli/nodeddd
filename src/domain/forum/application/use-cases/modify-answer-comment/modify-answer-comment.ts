import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import type { RequireAtLeastOne } from "@domain/core/types/require-at-least-one";
import { UseCase } from "@domain/core/use-cases/use-case";

import { AnswerComment } from "@domain/forum/enterprise/entities/answer-comment";

import {
  AnswerCommentNotFound,
  AnswerCommentModificationNotAllowed,
} from "../../errors/answer-comment.errors";

import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

interface ModifyAnswerCommentUseCaseRequest {
  actorId: PrimitiveUniqueId;
  commentId: PrimitiveUniqueId;
  data: RequireAtLeastOne<{
    content: string;
  }>;
}

interface Payload {
  comment: AnswerComment;
}

type ModifyAnswerCommentUseCaseResponse = Result<
  Payload,
  AnswerCommentNotFound | AnswerCommentModificationNotAllowed
>;

export class ModifyAnswerCommentUseCase
  implements
    UseCase<
      ModifyAnswerCommentUseCaseRequest,
      ModifyAnswerCommentUseCaseResponse
    >
{
  constructor(private readonly _commentsRepository: AnswerCommentsRepository) {}

  async execute({
    actorId,
    commentId,
    data,
  }: ModifyAnswerCommentUseCaseRequest): Promise<ModifyAnswerCommentUseCaseResponse> {
    const comment = await this._commentsRepository.findById(commentId);

    if (!comment) {
      return Result.fail(new AnswerCommentNotFound());
    }

    if (!comment.authorId.equals(actorId)) {
      return Result.fail(new AnswerCommentModificationNotAllowed());
    }

    if (data.content) comment.content = data.content;

    await this._commentsRepository.save(comment);

    return Result.ok({ comment });
  }
}
