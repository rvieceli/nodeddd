import { faker } from "@faker-js/faker";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  AnswerComment,
  CreateAnswerCommentProps,
} from "@domain/forum/enterprise/entities/answer-comment";
import { Text } from "@domain/forum/enterprise/entities/value-objects/text";

export function makeAnswerComment(
  override?: Partial<CreateAnswerCommentProps>,
  id?: UniqueId,
) {
  return AnswerComment.create(
    {
      content: Text.create(faker.lorem.paragraph()),
      authorId: UniqueId.create(),
      answerId: UniqueId.create(),
      ...override,
    },
    id,
  );
}
