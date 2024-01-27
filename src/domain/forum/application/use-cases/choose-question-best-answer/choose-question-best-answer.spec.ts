import { makeAnswer } from "@test/factories/make-answer";
import { makeQuestion } from "@test/factories/make-question";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswerNotFound } from "../../errors/answers.errors";
import {
  QuestionModificationNotAllowed,
  QuestionNotFound,
} from "../../errors/questions.errors";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";

import { ChooseQuestionBestAnswerUseCase } from "./choose-question-best-answer";

describe("Choose Question Best Answer [Use Case]", () => {
  let answersRepository: AnswersRepository;
  let answerAttachmentsRepository: AnswerAttachmentsRepository;
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: ChooseQuestionBestAnswerUseCase;

  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentsRepository,
    );

    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );
    sut = new ChooseQuestionBestAnswerUseCase(
      answersRepository,
      questionsRepository,
    );

    vi.spyOn(answersRepository, "findById");
    vi.spyOn(questionsRepository, "findById");
    vi.spyOn(questionsRepository, "save");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to choose a question best answer", async () => {
    //prepare
    const authorId = UniqueId.create();
    const question = makeQuestion({ authorId });

    await questionsRepository.create(question);

    const answer = makeAnswer({ questionId: question.id });

    await answersRepository.create(answer);

    const actorId = authorId.getId();
    const answerId = answer.id.getId();

    //act
    const result = await sut.execute({
      actorId,
      answerId,
    });

    const { question: questionWithBestAnswer } = result.unwrap();

    //assert
    expect(questionWithBestAnswer.bestAnswerId).toMatchObject(answer.id);

    expect(answersRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if actor is not the author", async () => {
    //prepare
    const question = makeQuestion();

    await questionsRepository.create(question);

    const answer = makeAnswer({ questionId: question.id });

    await answersRepository.create(answer);

    const actorId = UniqueId.getId();
    const answerId = answer.id.getId();

    //act
    const result = await sut.execute({
      actorId,
      answerId,
    });

    //assert
    expect(question.authorId.getId()).not.toBe(actorId);
    expect(result.value).toBeInstanceOf(QuestionModificationNotAllowed);

    expect(answersRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error when the answer does not exist", async () => {
    //prepare
    const actorId = UniqueId.getId();
    const answerId = UniqueId.getId();

    //act
    const result = await sut.execute({
      actorId,
      answerId,
    });

    //assert
    expect(result.value).toBeInstanceOf(AnswerNotFound);

    expect(answersRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.findById).not.toHaveBeenCalled();
    expect(questionsRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error when the question does not exist", async () => {
    //prepare
    const questionId = UniqueId.create();

    const answer = makeAnswer({ questionId });

    await answersRepository.create(answer);

    const actorId = UniqueId.getId();
    const answerId = answer.id.getId();

    //act
    const result = await sut.execute({
      actorId,
      answerId,
    });

    // assert
    expect(result.value).toBeInstanceOf(QuestionNotFound);

    expect(answersRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.findById).toHaveBeenCalledTimes(1);
    expect(questionsRepository.save).not.toHaveBeenCalled();
  });
});
