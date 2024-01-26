import { makeMany } from "@test/factories/make-many";
import { makeAnswerComment } from "@test/factories/make-answer-comment";

import { InMemoryAnswerCommentsRepository } from "@test/repositories/in-memory.answer-comments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { AnswerCommentsRepository } from "../../repositories/answer-comments.repository";

import { FetchAnswerCommentsUseCase } from "./fetch-answer-comments";

describe("Fetch answer comments [Use Case]", () => {
  let answerCommentsRepository: AnswerCommentsRepository;
  let sut: FetchAnswerCommentsUseCase;

  beforeEach(() => {
    answerCommentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new FetchAnswerCommentsUseCase(answerCommentsRepository);

    vi.spyOn(answerCommentsRepository, "findManyByAnswerId");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be able the fetch answers comments", async () => {
    // prepare
    const answer = UniqueId.create();

    answerCommentsRepository.create(
      makeAnswerComment({
        answerId: answer,
        createdAt: new Date(2024, 0, 14, 10, 0, 0),
      }),
    );
    answerCommentsRepository.create(
      makeAnswerComment({
        answerId: answer,
        createdAt: new Date(2024, 0, 16, 10, 0, 0),
      }),
    );
    answerCommentsRepository.create(
      makeAnswerComment({
        answerId: answer,
        createdAt: new Date(2024, 0, 15, 10, 0, 0),
      }),
    );

    const answerId = answer.getId();

    // act
    const result = await sut.execute({
      answerId,
      page: 1,
      pageSize: 10,
    });

    const response = result.unwrap();

    // assert
    expect(response.items).toEqual([
      expect.objectContaining({ createdAt: new Date(2024, 0, 14, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 15, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 16, 10, 0, 0) }),
    ]);

    expect(answerCommentsRepository.findManyByAnswerId).toHaveBeenNthCalledWith(
      1,
      answerId,
      { page: 1, pageSize: 10 },
    );
  });

  it("should be able the fetch answer comments with pagination", async () => {
    // prepare
    const answer = UniqueId.create();

    await makeMany(
      () =>
        answerCommentsRepository.create(
          makeAnswerComment({
            answerId: answer,
          }),
        ),
      29,
    );

    const answerId = answer.getId();

    // act
    const result1 = await sut.execute({
      answerId,
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

    expect(answerCommentsRepository.findManyByAnswerId).toHaveBeenCalledOnce();
    expect(answerCommentsRepository.findManyByAnswerId).toHaveBeenCalledWith(
      answerId,
      {
        page: 1,
        pageSize: 10,
      },
    );

    // act
    const result2 = await sut.execute({
      answerId,
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

    expect(answerCommentsRepository.findManyByAnswerId).toHaveBeenCalledTimes(
      2,
    );
    expect(answerCommentsRepository.findManyByAnswerId).toHaveBeenCalledWith(
      answerId,
      {
        page: 2,
        pageSize: 15,
      },
    );
  });
});
