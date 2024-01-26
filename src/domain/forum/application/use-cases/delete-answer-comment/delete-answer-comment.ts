import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import {
  AnswerCommentNotFound,
  AnswerCommentDeletionNotAllowed,
} from "../../errors/answer-comment.errors";

import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

interface DeleteAnswerCommentUseCaseRequest {
  actorId: PrimitiveUniqueId;
  commentId: PrimitiveUniqueId;
}

type DeleteAnswerCommentUseCaseResponse = Result<
  void,
  AnswerCommentNotFound | AnswerCommentDeletionNotAllowed
>;

export class DeleteAnswerCommentUseCase
  implements
    UseCase<
      DeleteAnswerCommentUseCaseRequest,
      DeleteAnswerCommentUseCaseResponse
    >
{
  constructor(private readonly _commentsRepository: AnswerCommentsRepository) {}

  async execute({
    commentId,
    actorId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const comment = await this._commentsRepository.findById(commentId);

    if (!comment) {
      return Result.fail(new AnswerCommentNotFound());
    }

    if (!comment.authorId.equals(actorId)) {
      return Result.fail(new AnswerCommentDeletionNotAllowed());
    }

    await this._commentsRepository.delete(comment);

    return Result.ok();
  }
}
