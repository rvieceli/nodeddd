import { UniqueId } from "@domain/core/entities/unique-id";
import {
  CreateAnswerAttachmentProps,
  AnswerAttachment,
} from "@domain/forum/enterprise/entities/answer-attachment";

export function makeAnswerAttachment(
  overrides?: Partial<CreateAnswerAttachmentProps>,
  id?: UniqueId,
): AnswerAttachment {
  return AnswerAttachment.create(
    {
      attachmentId: UniqueId.create(),
      answerId: UniqueId.create(),
      ...overrides,
    },
    id,
  );
}
