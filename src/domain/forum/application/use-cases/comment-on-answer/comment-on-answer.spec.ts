import { makeAnswer } from "@test/factories/make-answer";
import { makeQuestion } from "@test/factories/make-question";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";
import { InMemoryAnswerCommentsRepository } from "@test/repositories/in-memory.answer-comments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswerComment } from "@domain/forum/enterprise/entities/answer-comment";
import { text } from "@domain/forum/enterprise/entities/value-objects/text";

import { AnswerNotFound } from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";
import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";

import { CommentOnAnswerUseCase } from "./comment-on-answer";

describe("Comment on Answer [Use Case]", () => {
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let answersRepository: AnswersRepository;
  let answerAttachmentsRepository: AnswerAttachmentsRepository;
  let commentsRepository: AnswerCommentsRepository;
  let sut: CommentOnAnswerUseCase;

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );

    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentsRepository,
    );

    commentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new CommentOnAnswerUseCase(answersRepository, commentsRepository);

    vi.spyOn(answersRepository, "findById");
    vi.spyOn(commentsRepository, "create");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to create a comment", async () => {
    //prepare
    const question = makeQuestion();

    await questionsRepository.create(question);

    const answer = makeAnswer({ questionId: question.id });

    await answersRepository.create(answer);

    const answerId = answer.getId();
    const actorId = UniqueId.getId();

    //act
    const result = await sut.execute({
      answerId,
      actorId,
      content: "This is a comment",
    });

    const { comment } = result.unwrap();

    //assert
    expect(comment).toBeInstanceOf(AnswerComment);
    expect(comment).toMatchObject({
      content: text`This is a comment`,
      answerId: answer.id,
      authorId: UniqueId.create(actorId),
    });

    expect(answersRepository.findById).toHaveBeenNthCalledWith(1, answerId);
    expect(commentsRepository.create).toHaveBeenNthCalledWith(1, comment);
  });

  it("should throw an error when answer does not exist", async () => {
    //prepare
    const actorId = UniqueId.getId();
    const answerId = UniqueId.getId();

    //act

    const result = await sut.execute({
      actorId,
      answerId,
      content: "This is a comment",
    });

    //assert
    expect(result.value).toBeInstanceOf(AnswerNotFound);

    expect(answersRepository.findById).toHaveBeenNthCalledWith(1, answerId);
    expect(commentsRepository.create).not.toHaveBeenCalled();
  });
});
