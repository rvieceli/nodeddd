import { makeQuestionComment } from "@test/factories/make-question-comment";

import { InMemoryQuestionCommentsRepository } from "@test/repositories/in-memory.question-comments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  QuestionCommentNotFound,
  QuestionCommentModificationNotAllowed,
} from "../../errors/question-comment.errors";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";

import { ModifyQuestionCommentUseCase } from "./modify-question-comment";

describe("Modify question comment [Use Case]", () => {
  let questionCommentsRepository: QuestionCommentsRepository;
  let sut: ModifyQuestionCommentUseCase;

  beforeEach(() => {
    questionCommentsRepository = new InMemoryQuestionCommentsRepository();
    sut = new ModifyQuestionCommentUseCase(questionCommentsRepository);

    vi.spyOn(questionCommentsRepository, "findById");
    vi.spyOn(questionCommentsRepository, "save");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to modify an question comment", async () => {
    // prepare
    const authorId = UniqueId.create();

    const original = makeQuestionComment({
      content: "Old content",
      authorId,
    });

    await questionCommentsRepository.create(original);

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
        content: "New content",
      },
    });
    expect(questionCommentsRepository.findById).toHaveBeenNthCalledWith(
      1,
      commentId,
    );
    expect(questionCommentsRepository.save).toHaveBeenNthCalledWith(1, updated);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();

    const comment = makeQuestionComment({
      content: "Old content",
      authorId,
    });

    await questionCommentsRepository.create(comment);

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

    expect(result.value).toBeInstanceOf(QuestionCommentModificationNotAllowed);
    expect(questionCommentsRepository.findById).toHaveBeenNthCalledWith(
      1,
      commentId,
    );
    expect(questionCommentsRepository.save).not.toHaveBeenCalled();
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
    expect(result.value).toBeInstanceOf(QuestionCommentNotFound);
    expect(questionCommentsRepository.findById).toHaveBeenNthCalledWith(
      1,
      commentId,
    );
    expect(questionCommentsRepository.save).not.toHaveBeenCalled();
  });
});
