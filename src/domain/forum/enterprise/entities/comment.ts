import { AggregateRoot } from "@domain/core/entities/aggregate-root";
import { UniqueId } from "@domain/core/entities/unique-id";

import type { Optional } from "@domain/core/types/optional";

export interface CommentProps {
  authorId: UniqueId;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateCommentProps = Optional<CommentProps, "createdAt">;

const EXCERPT_LENGTH = 120;

export abstract class Comment<
  Props extends CommentProps,
> extends AggregateRoot<Props> {
  private touch() {
    this.props.updatedAt = new Date();
  }

  get content() {
    return this.props.content;
  }

  get excerpt() {
    if (this.props.content.length <= EXCERPT_LENGTH) return this.props.content;

    return this.props.content.slice(0, EXCERPT_LENGTH - 3).trim() + "...";
  }

  get authorId() {
    return this.props.authorId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  set content(value: string) {
    this.props.content = value;
    this.touch();
  }
}
