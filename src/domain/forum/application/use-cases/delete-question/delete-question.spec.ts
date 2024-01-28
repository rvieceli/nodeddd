import { makeQuestion } from "@test/factories/make-question";

import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  QuestionDeletionNotAllowed,
  QuestionNotFound,
} from "../../errors/questions.errors";

import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";

import { DeleteQuestionUseCase } from "./delete-question";

describe("Delete Question [Use Case]", () => {
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: DeleteQuestionUseCase;

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );

    sut = new DeleteQuestionUseCase(questionsRepository);

    vi.spyOn(questionsRepository, "delete");
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should delete a question", async () => {
    // prepare
    const authorId = UniqueId.create();
    const question = makeQuestion({
      authorId,
    });

    await questionsRepository.create(question);

    const questionId = question.getId();
    const actorId = authorId.getId();

    // act
    const result = await sut.execute({ questionId, actorId });

    // assert
    expect(result.isOk()).toBe(true);

    const deleted = await questionsRepository.findById(questionId);

    expect(deleted).toBeUndefined();
    expect(questionsRepository.delete).toHaveBeenNthCalledWith(1, question);
  });

  it("should throw an error if actor is not the author", async () => {
    // prepare
    const authorId = UniqueId.create();
    const victim = makeQuestion({
      authorId,
    });

    await questionsRepository.create(victim);

    const questionId = victim.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({ questionId, actorId });

    // assert
    expect(result.value).toBeInstanceOf(QuestionDeletionNotAllowed);

    expect(authorId.getId()).not.toBe(actorId);

    expect(questionsRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw an error if question does not exist", async () => {
    // prepare
    const questionId = UniqueId.getId();
    const actorId = UniqueId.getId();

    // act
    const result = await sut.execute({ questionId, actorId });

    // assert
    expect(result.value).toBeInstanceOf(QuestionNotFound);

    expect(questionsRepository.delete).not.toHaveBeenCalled();
  });
});
