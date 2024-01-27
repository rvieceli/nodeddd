import { Entity } from "@domain/core/entities/entity";
import { UniqueId } from "@domain/core/entities/unique-id";

interface AnswerAttachmentProps {
  answerId: UniqueId;
  attachmentId: UniqueId;
}

export type CreateAnswerAttachmentProps = AnswerAttachmentProps;

export class AnswerAttachment extends Entity<AnswerAttachmentProps> {
  static create(props: AnswerAttachmentProps, id?: UniqueId): AnswerAttachment {
    return new AnswerAttachment(props, id);
  }

  get answerId(): UniqueId {
    return this.props.answerId;
  }

  get attachmentId(): UniqueId {
    return this.props.attachmentId;
  }
}
