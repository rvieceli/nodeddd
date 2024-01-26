import { faker } from "@faker-js/faker";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  CreateQuestionProps,
  Question,
} from "@domain/forum/enterprise/entities/question";

export function makeQuestion(
  override?: Partial<CreateQuestionProps>,
  id?: UniqueId,
) {
  return Question.create(
    {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      authorId: UniqueId.create(),
      ...override,
    },
    id,
  );
}
