import { AggregateRoot } from "@domain/core/entities/aggregate-root";
import { UniqueId } from "@domain/core/entities/unique-id";
import type { Optional } from "@domain/core/types/optional";

import { Slug } from "./value-objects/slug";

import { QuestionAttachmentList } from "./question-attachment-list";
import { QuestionBestAnswerChosenEvent } from "../events/question-best-answer-chosen.event";

interface QuestionProps {
  title: string;
  content: string;
  slug: Slug;
  authorId: UniqueId;
  attachments?: QuestionAttachmentList;
  bestAnswerId?: UniqueId;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateQuestionProps = Optional<QuestionProps, "slug" | "createdAt">;

const EXCERPT_LENGTH = 120;

export class Question extends AggregateRoot<QuestionProps> {
  static create(props: CreateQuestionProps, id?: UniqueId): Question {
    const question = new Question(
      {
        ...props,
        slug: props.slug ?? Slug.fromString(props.title),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return question;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get excerpt(): string {
    if (this.props.content.length <= EXCERPT_LENGTH) return this.props.content;

    return this.props.content.slice(0, EXCERPT_LENGTH - 3).trim() + "...";
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get authorId(): UniqueId {
    return this.props.authorId;
  }

  get attachments(): QuestionAttachmentList | undefined {
    return this.props.attachments;
  }

  get bestAnswerId(): UniqueId | undefined {
    return this.props.bestAnswerId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  set title(value: string) {
    this.props.title = value;
    this.props.slug = Slug.fromString(value);
    this.touch();
  }

  set content(value: string) {
    this.props.content = value;
    this.touch();
  }

  set attachments(value: QuestionAttachmentList) {
    this.props.attachments = value;
    this.touch();
  }

  set bestAnswerId(value: UniqueId | undefined) {
    const isDefining = !!value && !this.props.bestAnswerId;
    const isChanging =
      !!value &&
      !!this.props.bestAnswerId &&
      !value.equals(this.props.bestAnswerId);

    if (isDefining || isChanging) {
      this.addDomainEvent(new QuestionBestAnswerChosenEvent(this, value));
    }

    this.props.bestAnswerId = value;
    this.touch();
  }
}
