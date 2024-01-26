import { Entity } from "@domain/core/entities/entity";
import { UniqueId } from "@domain/core/entities/unique-id";

import type { Optional } from "@domain/core/types/optional";

interface AnswerProps {
  content: string;
  questionId: UniqueId;
  authorId: UniqueId;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateAnswerProps = Optional<AnswerProps, "createdAt">;

const EXCERPT_LENGTH = 120;

export class Answer extends Entity<AnswerProps> {
  static create(props: CreateAnswerProps, id?: UniqueId): Answer {
    const answer = new Answer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return answer;
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
}
