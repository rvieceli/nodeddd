import { Entity } from "@domain/core/entities/entity";
import { UniqueId } from "@domain/core/entities/unique-id";

interface QuestionAttachmentProps {
  questionId: UniqueId;
  attachmentId: UniqueId;
}

export type CreateQuestionAttachmentProps = QuestionAttachmentProps;

export class QuestionAttachment extends Entity<QuestionAttachmentProps> {
  static create(
    props: QuestionAttachmentProps,
    id?: UniqueId,
  ): QuestionAttachment {
    return new QuestionAttachment(props, id);
  }

  get questionId(): UniqueId {
    return this.props.questionId;
  }

  get attachmentId(): UniqueId {
    return this.props.attachmentId;
  }
}
