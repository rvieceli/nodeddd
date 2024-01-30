import { faker } from "@faker-js/faker";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  CreateQuestionCommentProps,
  QuestionComment,
} from "@domain/forum/enterprise/entities/question-comment";
import { Text } from "@domain/forum/enterprise/entities/value-objects/text";

export function makeQuestionComment(
  override?: Partial<CreateQuestionCommentProps>,
  id?: UniqueId,
) {
  return QuestionComment.create(
    {
      content: Text.create(faker.lorem.paragraph()),
      authorId: UniqueId.create(),
      questionId: UniqueId.create(),
      ...override,
    },
    id,
  );
}
