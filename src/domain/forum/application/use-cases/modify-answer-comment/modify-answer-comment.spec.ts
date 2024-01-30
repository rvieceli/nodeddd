import { makeAnswerComment } from "@test/factories/make-answer-comment";

import { InMemoryAnswerCommentsRepository } from "@test/repositories/in-memory.answer-comments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { text } from "@domain/forum/enterprise/entities/value-objects/text";

import {
  AnswerCommentNotFound,
  AnswerCommentModificationNotAllowed,
} from "../../errors/answer-comment.errors";

import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

import { ModifyAnswerCommentUseCase } from "./modify-answer-comment";

describe("Modify answer comment [Use Case]", () => {
  let answerCommentsRepository: AnswerCommentsRepository;
  let sut: ModifyAnswerCommentUseCase;

  beforeEach(() => {
    answerCommentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new ModifyAnswerCommentUseCase(answerCommentsRepository);

    vi.spyOn(answerCommentsRepository, "findById");
    vi.spyOn(answerCommentsRepository, "save");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to modify an answer comment", async () => {
    // prepare
    const authorId = UniqueId.create();

    const original = makeAnswerComment({
      content: text`Old content`,
      authorId,
    });

    await answerCommentsRepository.create(original);

    const commentId = original.getId();
    const actorId = authorId.getId();

    // act
    const result = await sut.execute({
      actorId,
      commentId,
      data: {
        content: "New content",
      },
    });

    const { comment: updated } = result.unwrap();

    // assert
    expect(original).not.toMatchObject(updated);

    expect(updated).toMatchObject({
      props: {
        content: text`New content`,
      },
    });

    expect(answerCommentsRepository.findById).toHaveBeenNthCalledWith(
      1,
      commentId,
    );
    expect(answerCommentsRepository.save).toHaveBeenNthCalledWith(1, updated);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();

    const comment = makeAnswerComment({
      content: text`Old content`,
      authorId,
    });

    await answerCommentsRepository.create(comment);

    const commentId = comment.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({
      actorId,
      commentId,
      data: {
        content: "New content",
      },
    });

    // assert
    expect(authorId.getId()).not.toBe(actorId);

    expect(result.value).toBeInstanceOf(AnswerCommentModificationNotAllowed);

    expect(answerCommentsRepository.findById).toHaveBeenNthCalledWith(
      1,
      commentId,
    );
    expect(answerCommentsRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error if question does not exist", async () => {
    // prepare
    const commentId = UniqueId.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({
      commentId,
      actorId,
      data: {
        content: "New content",
      },
    });

    // assert
    expect(result.value).toBeInstanceOf(AnswerCommentNotFound);

    expect(answerCommentsRepository.findById).toHaveBeenNthCalledWith(
      1,
      commentId,
    );
    expect(answerCommentsRepository.save).not.toHaveBeenCalled();
  });
});
