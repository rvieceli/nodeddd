import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswerCommentCreatedEvent } from "../events/answer-comment-created.event";

import { Comment, type CreateCommentProps, type CommentProps } from "./comment";

interface AnswerCommentProps extends CommentProps {
  answerId: UniqueId;
}

export interface CreateAnswerCommentProps extends CreateCommentProps {
  answerId: UniqueId;
}

export class AnswerComment extends Comment<AnswerCommentProps> {
  static create(props: CreateAnswerCommentProps, id?: UniqueId): AnswerComment {
    const instance = new AnswerComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    const isNew = !id;

    if (isNew) {
      instance.addDomainEvent(new AnswerCommentCreatedEvent(instance));
    }

    return instance;
  }

  get answerId() {
    return this.props.answerId;
  }
}
