import { UniqueId } from "@domain/core/entities/unique-id";

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
    const answer = new QuestionComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return answer;
  }

  get questionId() {
    return this.props.questionId;
  }
}
