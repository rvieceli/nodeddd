import { UniqueId } from "@domain/core/entities/unique-id";

import { Comment, type CreateCommentProps, type CommentProps } from "./comment";

interface AnswerCommentProps extends CommentProps {
  answerId: UniqueId;
}

export interface CreateAnswerCommentProps extends CreateCommentProps {
  answerId: UniqueId;
}

export class AnswerComment extends Comment<AnswerCommentProps> {
  static create(props: CreateAnswerCommentProps, id?: UniqueId): AnswerComment {
    const answer = new AnswerComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return answer;
  }

  get answerId() {
    return this.props.answerId;
  }
}
