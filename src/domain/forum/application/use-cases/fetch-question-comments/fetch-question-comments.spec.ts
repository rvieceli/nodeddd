import { makeMany } from "@test/factories/make-many";
import { makeQuestionComment } from "@test/factories/make-question-comment";

import { InMemoryQuestionCommentsRepository } from "@test/repositories/in-memory.question-comments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";

import { FetchQuestionCommentsUseCase } from "./fetch-question-comments";

describe("Fetch question comments [Use Case]", () => {
  let questionCommentsRepository: QuestionCommentsRepository;

  let sut: FetchQuestionCommentsUseCase;

  beforeEach(() => {
    questionCommentsRepository = new InMemoryQuestionCommentsRepository();
    sut = new FetchQuestionCommentsUseCase(questionCommentsRepository);

    vi.spyOn(questionCommentsRepository, "findManyByQuestionId");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be able the fetch questions comments", async () => {
    // prepare
    const question = UniqueId.create();

    questionCommentsRepository.create(
      makeQuestionComment({
        questionId: question,
        createdAt: new Date(2024, 0, 14, 10, 0, 0),
      }),
    );
    questionCommentsRepository.create(
      makeQuestionComment({
        questionId: question,
        createdAt: new Date(2024, 0, 16, 10, 0, 0),
      }),
    );
    questionCommentsRepository.create(
      makeQuestionComment({
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

    expect(
      questionCommentsRepository.findManyByQuestionId,
    ).toHaveBeenNthCalledWith(1, questionId, { page: 1, pageSize: 10 });
  });

  it("should be able the fetch question comments with pagination", async () => {
    const question = UniqueId.create();

    // prepare
    await makeMany(
      () =>
        questionCommentsRepository.create(
          makeQuestionComment({
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

    expect(
      questionCommentsRepository.findManyByQuestionId,
    ).toHaveBeenCalledOnce();
    expect(
      questionCommentsRepository.findManyByQuestionId,
    ).toHaveBeenCalledWith(questionId, {
      page: 1,
      pageSize: 10,
    });

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

    expect(
      questionCommentsRepository.findManyByQuestionId,
    ).toHaveBeenCalledTimes(2);
    expect(
      questionCommentsRepository.findManyByQuestionId,
    ).toHaveBeenCalledWith(questionId, {
      page: 2,
      pageSize: 15,
    });
  });
});
