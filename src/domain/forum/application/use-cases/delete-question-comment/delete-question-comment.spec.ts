import { makeQuestionComment } from "@test/factories/make-question-comment";

import { InMemoryQuestionCommentsRepository } from "@test/repositories/in-memory.question-comments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  QuestionCommentDeletionNotAllowed,
  QuestionCommentNotFound,
} from "../../errors/question-comment.errors";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";

import { DeleteQuestionCommentUseCase } from "./delete-question-comment";

describe("Delete question comment [Use Case]", () => {
  let commentsRepository: QuestionCommentsRepository;
  let sut: DeleteQuestionCommentUseCase;

  beforeEach(() => {
    commentsRepository = new InMemoryQuestionCommentsRepository();
    sut = new DeleteQuestionCommentUseCase(commentsRepository);

    vi.spyOn(commentsRepository, "delete");
    vi.spyOn(commentsRepository, "findById");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should delete a question comment", async () => {
    const authorId = UniqueId.create();

    // prepare
    const comment = makeQuestionComment({
      authorId,
    });

    commentsRepository.create(comment);

    const commentId = comment.getId();
    const actorId = authorId.getId();

    // act
    const result = await sut.execute({ commentId, actorId });

    // assert
    expect(result.isOk()).toBe(true);

    expect(commentsRepository.findById).toHaveBeenNthCalledWith(1, commentId);
    expect(commentsRepository.delete).toHaveBeenNthCalledWith(1, comment);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();
    const comment = makeQuestionComment({ authorId });

    await commentsRepository.create(comment);

    const commentId = comment.getId();
    const actorId = UniqueId.getId();

    // act

    const result = await sut.execute({ commentId, actorId });

    // assert
    expect(result.value).toBeInstanceOf(QuestionCommentDeletionNotAllowed);
    expect(authorId.getId()).not.toBe(actorId);

    expect(commentsRepository.findById).toHaveBeenNthCalledWith(1, commentId);
    expect(commentsRepository.findById).toHaveReturnedWith(comment);
    expect(commentsRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw an error if question does not exist", async () => {
    // prepare
    const commentId = UniqueId.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({ commentId, actorId });

    // assert
    expect(result.value).toBeInstanceOf(QuestionCommentNotFound);

    expect(commentsRepository.findById).toHaveBeenNthCalledWith(1, commentId);
    expect(commentsRepository.findById).toHaveReturnedWith(undefined);
    expect(commentsRepository.delete).not.toHaveBeenCalled();
  });
});
