import { makeAnswerComment } from "@test/factories/make-answer-comment";

import { InMemoryAnswerCommentsRepository } from "@test/repositories/in-memory.answer-comments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  AnswerCommentNotFound,
  AnswerCommentDeletionNotAllowed,
} from "../../errors/answer-comment.errors";

import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

import { DeleteAnswerCommentUseCase } from "./delete-answer-comment";

describe("Delete answer comment [Use Case]", () => {
  let commentsRepository: AnswerCommentsRepository;
  let sut: DeleteAnswerCommentUseCase;

  beforeEach(() => {
    commentsRepository = new InMemoryAnswerCommentsRepository();

    sut = new DeleteAnswerCommentUseCase(commentsRepository);

    vi.spyOn(commentsRepository, "findById");
    vi.spyOn(commentsRepository, "delete");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should delete a answer comment", async () => {
    const authorId = UniqueId.create();

    // prepare
    const comment = makeAnswerComment({
      authorId,
    });

    commentsRepository.create(comment);

    const commentId = comment.getId();
    const actorId = authorId.getId();

    // act
    await sut.execute({ commentId, actorId });

    // assert
    expect(commentsRepository.findById).toHaveBeenNthCalledWith(1, commentId);
    expect(commentsRepository.delete).toHaveBeenNthCalledWith(1, comment);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();
    const comment = makeAnswerComment({ authorId });

    await commentsRepository.create(comment);

    const commentId = comment.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({ commentId, actorId });

    // assert
    expect(result.isFail()).toBe(true);
    expect(result.value).toBeInstanceOf(AnswerCommentDeletionNotAllowed);

    expect(authorId.getId()).not.toBe(actorId);

    expect(commentsRepository.findById).toHaveBeenNthCalledWith(1, commentId);
    expect(commentsRepository.findById).toHaveReturnedWith(comment);
    expect(commentsRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw an error if answer does not exist", async () => {
    // prepare
    const commentId = UniqueId.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({ commentId, actorId });

    // assert
    expect(result.isFail()).toBe(true);
    expect(result.value).toBeInstanceOf(AnswerCommentNotFound);

    expect(commentsRepository.findById).toHaveBeenNthCalledWith(1, commentId);
    expect(commentsRepository.findById).toHaveReturnedWith(undefined);
    expect(commentsRepository.delete).not.toHaveBeenCalled();
  });
});
