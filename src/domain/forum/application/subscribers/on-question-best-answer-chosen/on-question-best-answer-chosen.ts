import { DomainEventHandler } from "@domain/core/events/domain-event-handler";
import { DomainEvents } from "@domain/core/events/domain-events";
import { QuestionBestAnswerChosenEvent } from "@domain/forum/enterprise/events/question-best-answer-chosen.event";
import { AnswersRepository } from "../../repositories/answers.repository";
import { SendNotificationUseCase } from "@domain/notification/application/use-cases/send-notification/send-notification";

export class OnQuestionBestAnswerChosenHandler implements DomainEventHandler {
  constructor(
    private readonly _answersRepository: AnswersRepository,
    private readonly _sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestAnswerChosenEvent.name,
    );
  }

  private async sendQuestionBestAnswerNotification({
    question,
    bestAnswerId,
  }: QuestionBestAnswerChosenEvent) {
    const answer = await this._answersRepository.findById(bestAnswerId.getId());

    if (!answer) {
      // it should never happen
      // it should throw a domain exception??
      throw new Error(`Answer ${bestAnswerId} not found`);
    }

    if (answer.authorId.equals(question.authorId)) {
      return;
    }

    this._sendNotification.execute({
      recipientId: answer.authorId.getId(),
      title: `Your answer was chosen as the best answer`,
      content: `Your answer "${answer.excerpt}" was chosen as the best answer for the question "${question.title}"`,
    });
  }
}
