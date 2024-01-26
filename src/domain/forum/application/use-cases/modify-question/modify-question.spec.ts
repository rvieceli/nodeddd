import { makeQuestion } from "@test/factories/make-question";

import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  QuestionNotFound,
  QuestionModificationNotAllowed,
} from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";

import { ModifyQuestionUseCase } from "./modify-question";

describe("Modify Question [Use Case]", () => {
  let questionsRepository: QuestionsRepository;
  let sut: ModifyQuestionUseCase;

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new ModifyQuestionUseCase(questionsRepository);

    vi.spyOn(questionsRepository, "save");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to modify a question", async () => {
    // prepare
    const authorId = UniqueId.create();

    const original = makeQuestion({
      content: "Old content",
      title: "Old title",
      authorId,
    });

    await questionsRepository.create(original);

    // act
    const result = await sut.execute({
      actorId: authorId.getId(),
      questionId: original.getId(),
      data: {
        content: "New content",
        title: "New title",
      },
    });

    const { question: updated } = result.unwrap();

    // assert
    expect(original).not.toMatchObject(updated);
    expect(updated).toMatchObject({
      props: {
        content: "New content",
        title: "New title",
      },
    });
    expect(questionsRepository.save).toHaveBeenNthCalledWith(1, updated);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();

    const question = makeQuestion({
      content: "Old content",
      title: "Old title",
      authorId,
    });

    await questionsRepository.create(question);

    const questionId = question.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({
      actorId,
      questionId,
      data: {
        title: "New title",
      },
    });

    // assert
    expect(authorId.getId()).not.toBe(actorId);
    expect(result.value).toBeInstanceOf(QuestionModificationNotAllowed);
    expect(questionsRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error if question does not exist", async () => {
    // prepare
    const questionId = UniqueId.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({
      questionId,
      actorId,
      data: {
        title: "New title",
      },
    });

    // assert
    expect(result.value).toBeInstanceOf(QuestionNotFound);
    expect(questionsRepository.save).not.toHaveBeenCalled();
  });
});
