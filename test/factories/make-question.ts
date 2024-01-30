import { faker } from "@faker-js/faker";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  CreateQuestionProps,
  Question,
} from "@domain/forum/enterprise/entities/question";
import { Text } from "@domain/forum/enterprise/entities/value-objects/text";

export function makeQuestion(
  override?: Partial<CreateQuestionProps>,
  id?: UniqueId,
) {
  return Question.create(
    {
      title: Text.create(faker.lorem.sentence()),
      content: Text.create(faker.lorem.paragraph()),
      authorId: UniqueId.create(),
      ...override,
    },
    id,
  );
}
