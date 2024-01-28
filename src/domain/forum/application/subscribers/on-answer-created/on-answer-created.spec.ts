import { makeAnswer } from "@test/factories/make-answer";
import { makeQuestion } from "@test/factories/make-question";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryNotificationsRepository } from "@test/repositories/in-memory.notifications.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { NotificationsRepository } from "@domain/notification/application/repositories/notifications.repository";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";

import { OnAnswerCreatedHandler } from "./on-answer-created";
import { DomainEvents } from "@domain/core/events/domain-events";

describe("On answer created [SUBSCRIBER]", () => {
  let questionsAttachmentsRepository: QuestionAttachmentsRepository;
  let questionsRepository: QuestionsRepository;

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

    notificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      notificationsRepository,
    );

    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentsRepository,
    );

    DomainEvents.clearHandlers();

    new OnAnswerCreatedHandler(questionsRepository, sendNotificationUseCase);

    vi.spyOn(sendNotificationUseCase, "execute");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should send a notification when answer is created", async () => {
    // prepare
    const question = makeQuestion();

    const answer = makeAnswer({
      questionId: question.id,
    });

    await questionsRepository.create(question);

    // act
    await answersRepository.create(answer);

    expect(sendNotificationUseCase.execute).toHaveBeenCalledTimes(1);

    // assert
    expect(sendNotificationUseCase.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        recipientId: question.authorId.getId(),
      }),
    );
  });

  describe("when answer is created by the question author", () => {
    it("should not send a notification", async () => {
      // prepare
      const authorId = UniqueId.create();

      const question = makeQuestion({
        authorId,
      });

      await questionsRepository.create(question);

      const answer = makeAnswer({
        questionId: question.id,
        authorId,
      });

      // act
      await answersRepository.create(answer);

      // assert
      expect(sendNotificationUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
