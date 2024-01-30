import { DomainEventHandler } from "@domain/core/events/domain-event-handler";
import { DomainEvents } from "@domain/core/events/domain-events";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionCommentCreatedEvent } from "@domain/forum/enterprise/events/question-comment-created-event";

export class OnQuestionCommentCreatedHandler implements DomainEventHandler {
  constructor(
    private readonly _questionsRepository: QuestionsRepository,
    private readonly _sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewQuestionNotification.bind(this),
      QuestionCommentCreatedEvent.name,
    );
  }

  private async sendNewQuestionNotification({
    questionComment,
  }: QuestionCommentCreatedEvent) {
    const questionId = questionComment.questionId.getId();

    const question = await this._questionsRepository.findById(questionId);

    if (!question) {
      // it should never happen
      // it should throw a domain exception??
      throw new Error(`Question ${questionId} not found`);
    }

    if (question.authorId.equals(questionComment.authorId)) {
      return;
    }

    await this._sendNotification.execute({
      recipientId: question.authorId.getId(),
      title: `You've received a new comment`,
      content: `Your question ${question.title.excerpt(60)} has received a comment: ${questionComment.content.excerpt(120)}`,
    });
  }
}
