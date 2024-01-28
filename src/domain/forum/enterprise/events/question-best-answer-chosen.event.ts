import { UniqueId } from "@domain/core/entities/unique-id";
import { DomainEvent } from "@domain/core/events/domain-event";
import { type Question } from "../entities/question";

export class QuestionBestAnswerChosenEvent implements DomainEvent {
  occurredAt: Date;
  question: Question;
  bestAnswerId: UniqueId;

  constructor(question: Question, bestAnswerId: UniqueId) {
    this.occurredAt = new Date();
    this.question = question;
    this.bestAnswerId = bestAnswerId;
  }
}
