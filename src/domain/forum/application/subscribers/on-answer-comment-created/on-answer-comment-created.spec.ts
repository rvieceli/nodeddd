import { makeAnswer } from "@test/factories/make-answer";
import { makeQuestion } from "@test/factories/make-question";
import { makeAnswerComment } from "@test/factories/make-answer-comment";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";
import { InMemoryAnswerCommentsRepository } from "@test/repositories/in-memory.answer-comments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryNotificationsRepository } from "@test/repositories/in-memory.notifications.repository";

import { UniqueId } from "@domain/core/entities/unique-id";
import { DomainEvents } from "@domain/core/events/domain-events";

import { NotificationsRepository } from "@domain/notification/application/repositories/notifications.repository";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";
import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";

import { OnAnswerCommentCreatedHandler } from "./on-answer-comment-created";

describe("On answer comment created [SUBSCRIBER]", () => {
  let questionsAttachmentsRepository: QuestionAttachmentsRepository;
  let questionsRepository: QuestionsRepository;

  let answerCommentsRepository: AnswerCommentsRepository;

  let answersRepository: AnswersRepository;
  let answerAttachmentsRepository: AnswerAttachmentsRepository;

  let notificationsRepository: NotificationsRepository;
  let sendNotificationUseCase: SendNotificationUseCase;

  beforeEach(() => {
    questionsAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionsAttachmentsRepository,
    );

    answerCommentsRepository = new InMemoryAnswerCommentsRepository();

    notificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      notificationsRepository,
    );

    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentsRepository,
    );

    DomainEvents.clearHandlers();

    new OnAnswerCommentCreatedHandler(
      answersRepository,
      sendNotificationUseCase,
    );

    vi.spyOn(sendNotificationUseCase, "execute");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should send a notification when comment is created", async () => {
    // prepare
    const question = makeQuestion();

    await questionsRepository.create(question);

    const answer = makeAnswer({
      questionId: question.id,
    });

    await answersRepository.create(answer);

    // act
    const comment = makeAnswerComment({
      answerId: answer.id,
    });
    await answerCommentsRepository.create(comment);

    // assert
    expect(sendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
    expect(sendNotificationUseCase.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        recipientId: answer.authorId.getId(),
      }),
    );
  });

  describe("when comment is created by the answer author", () => {
    it("should not send a notification", async () => {
      // prepare
      const authorId = UniqueId.create();

      const question = makeQuestion({});

      await questionsRepository.create(question);

      const answer = makeAnswer({
        questionId: question.id,
        authorId,
      });

      await answersRepository.create(answer);

      // act
      const comment = makeAnswerComment({
        answerId: answer.id,
        authorId,
      });
      await answerCommentsRepository.create(comment);

      // assert
      expect(sendNotificationUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
