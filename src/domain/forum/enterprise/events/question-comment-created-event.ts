import { DomainEvent } from "@domain/core/events/domain-event";
import { type QuestionComment } from "../entities/question-comment";

export class QuestionCommentCreatedEvent implements DomainEvent {
  occurredAt: Date;
  questionComment: QuestionComment;

  constructor(questionComment: QuestionComment) {
    this.occurredAt = new Date();
    this.questionComment = questionComment;
  }
}
