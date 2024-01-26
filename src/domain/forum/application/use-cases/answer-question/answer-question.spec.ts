import { makeQuestion } from "@test/factories/make-question";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswersRepository } from "../../repositories/answers.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";

import { AnswerQuestionUseCase } from "./answer-question";
import { QuestionNotFound } from "../../errors/questions.errors";

describe("Answer question [UseCase]", () => {
  let answersRepository: AnswersRepository;
  let questionsRepository: QuestionsRepository;
  let sut: AnswerQuestionUseCase;

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository();
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new AnswerQuestionUseCase(answersRepository, questionsRepository);

    vi.spyOn(questionsRepository, "findById");
    vi.spyOn(answersRepository, "create");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should create an answer", async () => {
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

    expect(questionsRepository.findById).toHaveBeenNthCalledWith(1, questionId);
    expect(answersRepository.create).not.toHaveBeenCalled();
  });
});
