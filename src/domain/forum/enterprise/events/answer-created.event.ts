import { DomainEvent } from "@domain/core/events/domain-event";
import { type Answer } from "../entities/answer";

export class AnswerCreatedEvent implements DomainEvent {
  occurredAt: Date;
  answer: Answer;

  constructor(answer: Answer) {
    this.occurredAt = new Date();
    this.answer = answer;
  }
}
