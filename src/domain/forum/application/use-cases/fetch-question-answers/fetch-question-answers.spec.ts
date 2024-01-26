import { makeAnswer } from "@test/factories/make-answer";
import { makeMany } from "@test/factories/make-many";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswersRepository } from "../../repositories/answers.repository";

import { FetchQuestionAnswersUseCase } from "./fetch-question-answers";

describe("Fetch Question Answers [Use Case]", () => {
  let answersRepository: AnswersRepository;

  let sut: FetchQuestionAnswersUseCase;

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository();
    sut = new FetchQuestionAnswersUseCase(answersRepository);

    vi.spyOn(answersRepository, "findManyByQuestionId");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be able the fetch recent questions", async () => {
    // prepare
    const question = UniqueId.create();

    answersRepository.create(
      makeAnswer({
        questionId: question,
        createdAt: new Date(2024, 0, 14, 10, 0, 0),
      }),
    );
    answersRepository.create(
      makeAnswer({
        questionId: question,
        createdAt: new Date(2024, 0, 16, 10, 0, 0),
      }),
    );
    answersRepository.create(
      makeAnswer({
        questionId: question,
        createdAt: new Date(2024, 0, 15, 10, 0, 0),
      }),
    );

    const questionId = question.getId();

    // act
    const result = await sut.execute({
      questionId,
      page: 1,
      pageSize: 10,
    });

    const page = result.unwrap();

    // assert
    expect(page.items).toEqual([
      expect.objectContaining({ createdAt: new Date(2024, 0, 14, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 15, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 16, 10, 0, 0) }),
    ]);

    expect(answersRepository.findManyByQuestionId).toHaveBeenNthCalledWith(
      1,
      questionId,
      { page: 1, pageSize: 10 },
    );
  });

  it("should be able the fetch recent questions with pagination", async () => {
    vi.spyOn(answersRepository, "findManyByQuestionId");

    const question = UniqueId.create();

    // prepare
    await makeMany(
      () =>
        answersRepository.create(
          makeAnswer({
            questionId: question,
          }),
        ),
      29,
    );

    const questionId = question.getId();

    // act
    const result1 = await sut.execute({
      questionId,
      page: 1,
      pageSize: 10,
    });

    const page1 = result1.unwrap();

    // assert
    expect(page1).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 29,
      totalPages: 3,
      items: expect.any(Array),
    });

    expect(page1.items).toHaveLength(10);

    expect(answersRepository.findManyByQuestionId).toHaveBeenCalledOnce();
    expect(answersRepository.findManyByQuestionId).toHaveBeenCalledWith(
      questionId,
      {
        page: 1,
        pageSize: 10,
      },
    );

    // act
    const result2 = await sut.execute({
      questionId,
      page: 2,
      pageSize: 15,
    });

    const page2 = result2.unwrap();

    // assert
    expect(page2).toMatchObject({
      page: 2,
      pageSize: 15,
      total: 29,
      totalPages: 2,
      items: expect.any(Array),
    });

    expect(page2.items).toHaveLength(14);

    expect(answersRepository.findManyByQuestionId).toHaveBeenCalledTimes(2);
    expect(answersRepository.findManyByQuestionId).toHaveBeenCalledWith(
      questionId,
      {
        page: 2,
        pageSize: 15,
      },
    );
  });
});
