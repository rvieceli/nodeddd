import { UniqueId } from "@domain/core/entities/unique-id";

import { QuestionCommentCreatedEvent } from "../events/question-comment-created-event";

import { Comment, type CommentProps, type CreateCommentProps } from "./comment";

interface QuestionCommentProps extends CommentProps {
  questionId: UniqueId;
}

export interface CreateQuestionCommentProps extends CreateCommentProps {
  questionId: UniqueId;
}

export class QuestionComment extends Comment<QuestionCommentProps> {
  static create(
    props: CreateQuestionCommentProps,
    id?: UniqueId,
  ): QuestionComment {
    const instance = new QuestionComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    const isNew = !id;

    if (isNew) {
      instance.addDomainEvent(new QuestionCommentCreatedEvent(instance));
    }

    return instance;
  }

  get questionId() {
    return this.props.questionId;
  }
}
