import { DomainEventHandler } from "@domain/core/events/domain-event-handler";
import { DomainEvents } from "@domain/core/events/domain-events";
import { AnswerCreatedEvent } from "@domain/forum/enterprise/events/answer-created.event";
import { QuestionsRepository } from "../../repositories/questions.repository";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";

export class OnAnswerCreatedHandler implements DomainEventHandler {
  constructor(
    private readonly _questionsRepository: QuestionsRepository,
    private readonly _sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCreatedEvent.name,
    );
  }

  private async sendNewAnswerNotification({ answer }: AnswerCreatedEvent) {
    const questionId = answer.questionId.getId();

    const question = await this._questionsRepository.findById(questionId);

    if (!question) {
      // it should never happen
      // it should throw a domain exception??
      throw new Error(`Question ${questionId} not found`);
    }

    if (answer.authorId.equals(question.authorId)) {
      return;
    }

    await this._sendNotification.execute({
      recipientId: question.authorId.getId(),
      title: `Your question "${question.title}" has a new answer`,
      content: answer.excerpt,
    });
  }
}
