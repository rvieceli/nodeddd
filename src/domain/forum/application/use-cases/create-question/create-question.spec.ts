import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { QuestionsRepository } from "../../repositories/questions.repository";

import { CreateQuestionUseCase } from "./create-question";

describe("Create Question [UseCase]", () => {
  let questionsRepository: QuestionsRepository;
  let sut: CreateQuestionUseCase;

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new CreateQuestionUseCase(questionsRepository);

    vi.spyOn(questionsRepository, "create");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be able to create a question", async () => {
    // act
    const result = await sut.execute({
      authorId: "1",
      title: "New question",
      content: "New question content",
    });

    // assert
    const { question } = result.unwrap();

    expect(question).toMatchObject({
      title: "New question",
      content: "New question content",
    });

    expect(questionsRepository.create).toHaveBeenNthCalledWith(1, question);
  });
});
