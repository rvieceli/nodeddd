import { makeQuestion } from "@test/factories/make-question";
import { makeQuestionComment } from "@test/factories/make-question-comment";

import { InMemoryQuestionCommentsRepository } from "@test/repositories/in-memory.question-comments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryNotificationsRepository } from "@test/repositories/in-memory.notifications.repository";

import { UniqueId } from "@domain/core/entities/unique-id";
import { DomainEvents } from "@domain/core/events/domain-events";

import { NotificationsRepository } from "@domain/notification/application/repositories/notifications.repository";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";
import { OnQuestionCommentCreatedHandler } from "./on-question-comment-created";

describe("On answer comment created [SUBSCRIBER]", () => {
  let questionsAttachmentsRepository: QuestionAttachmentsRepository;
  let questionsRepository: QuestionsRepository;

  let questionCommentsRepository: QuestionCommentsRepository;

  let notificationsRepository: NotificationsRepository;
  let sendNotificationUseCase: SendNotificationUseCase;

  beforeEach(() => {
    questionsAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionsAttachmentsRepository,
    );

    questionCommentsRepository = new InMemoryQuestionCommentsRepository();

    notificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      notificationsRepository,
    );

    DomainEvents.clearHandlers();

    new OnQuestionCommentCreatedHandler(
      questionsRepository,
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

    // act
    const comment = makeQuestionComment({
      questionId: question.id,
    });
    await questionCommentsRepository.create(comment);

    // assert
    expect(sendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
    expect(sendNotificationUseCase.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        recipientId: question.authorId.getId(),
      }),
    );
  });

  describe("when comment is created by the author", () => {
    it("should not send a notification", async () => {
      // prepare
      const authorId = UniqueId.create();

      const question = makeQuestion({
        authorId,
      });

      await questionsRepository.create(question);

      // act
      const comment = makeQuestionComment({
        questionId: question.id,
        authorId,
      });
      await questionCommentsRepository.create(comment);

      // assert
      expect(sendNotificationUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
