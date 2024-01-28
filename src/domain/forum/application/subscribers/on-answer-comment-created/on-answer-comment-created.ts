import { DomainEventHandler } from "@domain/core/events/domain-event-handler";
import { DomainEvents } from "@domain/core/events/domain-events";
import { AnswerCommentCreatedEvent } from "@domain/forum/enterprise/events/answer-comment-created.event";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";
import { AnswersRepository } from "../../repositories/answers.repository";

export class OnAnswerCommentCreatedHandler implements DomainEventHandler {
  constructor(
    private readonly _answersRepository: AnswersRepository,
    private readonly _sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCommentCreatedEvent.name,
    );
  }

  private async sendNewAnswerNotification({
    answerComment,
  }: AnswerCommentCreatedEvent) {
    const answerId = answerComment.answerId.getId();

    const answer = await this._answersRepository.findById(answerId);

    if (!answer) {
      // it should never happen
      // it should throw a domain exception??
      throw new Error(`Answer ${answerId} not found`);
    }

    if (answer.authorId.equals(answerComment.authorId)) {
      return;
    }

    await this._sendNotification.execute({
      recipientId: answer.authorId.getId(),
      title: `You've received a new comment`,
      content: `Your answer ${answer.excerpt} has received a comment: ${answerComment.excerpt}`,
    });
  }
}
