import { makeAnswer } from "@test/factories/make-answer";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswerNotFound } from "../../errors/answers.errors";
import { AnswerModificationNotAllowed } from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";

import { ModifyAnswerUseCase } from "./modify-answer";

describe("Modify Answer [Use Case]", () => {
  let answersRepository: AnswersRepository;
  let sut: ModifyAnswerUseCase;

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository();
    sut = new ModifyAnswerUseCase(answersRepository);

    vi.spyOn(answersRepository, "save");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to modify an answer", async () => {
    // prepare
    const authorId = UniqueId.create();

    const original = makeAnswer({
      content: "Old content",
      authorId,
    });

    await answersRepository.create(original);

    // act
    const result = await sut.execute({
      actorId: authorId.getId(),
      answerId: original.getId(),
      data: {
        content: "New content",
      },
    });

    const { answer: updated } = result.unwrap();

    // assert
    expect(original).not.toMatchObject(updated);

    expect(updated).toMatchObject({
      props: {
        content: "New content",
      },
    });

    expect(answersRepository.save).toHaveBeenNthCalledWith(1, updated);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();

    const question = makeAnswer({
      content: "Old content",
      authorId,
    });

    await answersRepository.create(question);

    const answerId = question.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({
      actorId,
      answerId,
      data: {
        content: "New content",
      },
    });

    // assert
    expect(authorId.getId()).not.toBe(actorId);

    expect(result.value).toBeInstanceOf(AnswerModificationNotAllowed);

    expect(answersRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error if question does not exist", async () => {
    // prepare
    const answerId = UniqueId.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({
      answerId,
      actorId,
      data: {
        content: "New content",
      },
    });

    // assert
    expect(result.value).toBeInstanceOf(AnswerNotFound);

    expect(answersRepository.save).not.toHaveBeenCalled();
  });
});
