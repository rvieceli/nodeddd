import { faker } from "@faker-js/faker";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  CreateAnswerProps,
  Answer,
} from "@domain/forum/enterprise/entities/answer";

export function makeAnswer(
  override?: Partial<CreateAnswerProps>,
  id?: UniqueId,
) {
  return Answer.create(
    {
      content: faker.lorem.paragraph(),
      authorId: UniqueId.create(),
      questionId: UniqueId.create(),
      ...override,
    },
    id,
  );
}
