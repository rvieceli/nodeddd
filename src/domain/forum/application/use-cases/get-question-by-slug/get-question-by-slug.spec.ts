import { makeQuestion } from "@test/factories/make-question";

import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { QuestionNotFound } from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";

import { GetQuestionBySlugUseCase } from "./get-question-by-slug";

describe("Get Question By Slug [UseCase]", () => {
  let questionsRepository: QuestionsRepository;
  let sut: GetQuestionBySlugUseCase;

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new GetQuestionBySlugUseCase(questionsRepository);

    vi.spyOn(questionsRepository, "findBySlug");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return a question", async () => {
    // prepare
    const original = makeQuestion({
      title: "This is a question",
    });

    questionsRepository.create(original);

    const slug = "this-is-a-question";

    // act
    const result = await sut.execute({ slug });

    const { question } = result.unwrap();

    // assert
    expect(question).toMatchObject(original);
    expect(question.slug.equals(slug)).toBe(true);

    expect(questionsRepository.findBySlug).toHaveBeenNthCalledWith(1, slug);
  });

  it("should throw an error if question does not exist", async () => {
    // prepare
    const slug = "this-question-does-not-exist";

    // act
    const result = await sut.execute({ slug });

    // assert
    expect(result.value).toBeInstanceOf(QuestionNotFound);
  });
});
