import { AggregateRoot } from "@domain/core/entities/aggregate-root";
import { UniqueId } from "@domain/core/entities/unique-id";

import type { Optional } from "@domain/core/types/optional";

import { Text } from "./value-objects/text";

export interface CommentProps {
  authorId: UniqueId;
  content: Text;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateCommentProps = Optional<CommentProps, "createdAt">;

export abstract class Comment<
  Props extends CommentProps,
> extends AggregateRoot<Props> {
  private touch() {
    this.props.updatedAt = new Date();
  }

  get content(): Text {
    return this.props.content;
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
    this.props.content = Text.create(value);
    this.touch();
  }
}
