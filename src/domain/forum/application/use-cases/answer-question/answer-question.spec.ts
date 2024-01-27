import { makeQuestion } from "@test/factories/make-question";

import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";
import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";

import { QuestionNotFound } from "../../errors/questions.errors";

import { AnswerQuestionUseCase } from "./answer-question";

describe("Answer question [UseCase]", () => {
  let answersRepository: AnswersRepository;
  let answersAttachmentsRepository: AnswerAttachmentsRepository;
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: AnswerQuestionUseCase;

  beforeEach(() => {
    answersAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answersAttachmentsRepository,
    );

    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );

    sut = new AnswerQuestionUseCase(answersRepository, questionsRepository);

    vi.spyOn(questionsRepository, "findById");
    vi.spyOn(answersRepository, "create");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to create an answer", async () => {
    //prepare
    const question = makeQuestion();

    await questionsRepository.create(question);

    const actorId = UniqueId.getId();
    const questionId = question.id.getId();

    //act
    const result = await sut.execute({
      content: "New reply",
      actorId,
      questionId,
    });

    const { answer } = result.unwrap();

    expect(result.isOk()).toBe(true);

    //assert
    expect(answer).toMatchObject({
      content: "New reply",
      questionId: question.id,
      authorId: UniqueId.create(actorId),
    });

    expect(questionsRepository.findById).toHaveBeenNthCalledWith(1, questionId);
    expect(answersRepository.create).toHaveBeenNthCalledWith(1, answer);
  });

  it("should be able to create an answer with attachments", async () => {
    //prepare
    const question = makeQuestion();

    await questionsRepository.create(question);

    const actorId = UniqueId.getId();
    const questionId = question.id.getId();
    const attachmentIds = [UniqueId.getId(), UniqueId.getId()];

    //act
    const result = await sut.execute({
      content: "New reply",
      actorId,
      questionId,
      attachmentIds,
    });

    const { answer } = result.unwrap();

    //assert
    expect(result.isOk()).toBe(true);

    expect(answer.attachments?.currentItems).toMatchObject(
      attachmentIds.map((id) => ({
        attachmentId: UniqueId.create(id),
        answerId: answer.id,
      })),
    );
    expect(questionsRepository.findById).toHaveBeenNthCalledWith(1, questionId);
    expect(answersRepository.create).toHaveBeenNthCalledWith(1, answer);
  });

  describe("when the answer cannot be created", () => {
    it("should throw an error when question does not exist", async () => {
      //prepare
      const actorId = UniqueId.getId();
      const questionId = UniqueId.getId();

      //act
      const result = await sut.execute({
        content: "New reply",
        actorId,
        questionId,
      });

      //assert
      expect(result.isFail()).toBe(true);
      expect(result.value).toBeInstanceOf(QuestionNotFound);

      expect(questionsRepository.findById).toHaveBeenNthCalledWith(
        1,
        questionId,
      );
      expect(answersRepository.create).not.toHaveBeenCalled();
    });
  });
});
