import { AggregateRoot } from "@domain/core/entities/aggregate-root";
import { UniqueId } from "@domain/core/entities/unique-id";

import type { Optional } from "@domain/core/types/optional";
import { AnswerAttachmentList } from "./answer-attachment-list";
import { AnswerCreatedEvent } from "../events/answer-created.event";

interface AnswerProps {
  content: string;
  questionId: UniqueId;
  authorId: UniqueId;
  attachments?: AnswerAttachmentList;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateAnswerProps = Optional<AnswerProps, "createdAt">;

const EXCERPT_LENGTH = 120;

export class Answer extends AggregateRoot<AnswerProps> {
  static create(props: CreateAnswerProps, id?: UniqueId): Answer {
    const instance = new Answer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    const isNew = !id;

    if (isNew) {
      instance.addDomainEvent(new AnswerCreatedEvent(instance));
    }

    return instance;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  get content(): string {
    return this.props.content;
  }

  get excerpt(): string {
    if (this.props.content.length <= EXCERPT_LENGTH) return this.props.content;

    return this.props.content.slice(0, EXCERPT_LENGTH - 3).trim() + "...";
  }

  get questionId() {
    return this.props.questionId;
  }

  get authorId() {
    return this.props.authorId;
  }

  get attachments(): AnswerAttachmentList | undefined {
    return this.props.attachments;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  set content(value: string) {
    this.props.content = value;
    this.touch();
  }

  set attachments(value: AnswerAttachmentList) {
    this.props.attachments = value;
    this.touch();
  }
}
