import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import { Result } from "@domain/core/errors/result";
import { UseCase } from "@domain/core/use-cases/use-case";

import {
  QuestionCommentDeletionNotAllowed,
  QuestionCommentNotFound,
} from "../../errors/question-comment.errors";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";

interface DeleteQuestionCommentUseCaseRequest {
  actorId: PrimitiveUniqueId;
  commentId: PrimitiveUniqueId;
}

type DeleteQuestionCommentUseCaseResponse = Result<
  void,
  QuestionCommentDeletionNotAllowed | QuestionCommentNotFound
>;

export class DeleteQuestionCommentUseCase
  implements
    UseCase<
      DeleteQuestionCommentUseCaseRequest,
      DeleteQuestionCommentUseCaseResponse
    >
{
  constructor(
    private readonly _commentsRepository: QuestionCommentsRepository,
  ) {}

  async execute({
    commentId,
    actorId,
  }: DeleteQuestionCommentUseCaseRequest): Promise<DeleteQuestionCommentUseCaseResponse> {
    const comment = await this._commentsRepository.findById(commentId);

    if (!comment) {
      return Result.fail(new QuestionCommentNotFound());
    }

    if (!comment.authorId.equals(actorId)) {
      return Result.fail(new QuestionCommentDeletionNotAllowed());
    }

    await this._commentsRepository.delete(comment);

    return Result.ok();
  }
}
