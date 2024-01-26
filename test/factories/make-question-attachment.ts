import { UniqueId } from "@domain/core/entities/unique-id";
import {
  CreateQuestionAttachmentProps,
  QuestionAttachment,
} from "@domain/forum/enterprise/entities/question-attachment";

export function makeQuestionAttachment(
  overrides?: Partial<CreateQuestionAttachmentProps>,
  id?: UniqueId,
): QuestionAttachment {
  return QuestionAttachment.create(
    {
      attachmentId: UniqueId.create(),
      questionId: UniqueId.create(),
      ...overrides,
    },
    id,
  );
}
