import { DomainEvent } from "@domain/core/events/domain-event";
import { type AnswerComment } from "../entities/answer-comment";

export class AnswerCommentCreatedEvent implements DomainEvent {
  occurredAt: Date;
  answerComment: AnswerComment;

  constructor(answerComment: AnswerComment) {
    this.occurredAt = new Date();
    this.answerComment = answerComment;
  }
}
