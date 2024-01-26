import { makeMany } from "@test/factories/make-many";
import { makeQuestion } from "@test/factories/make-question";

import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";

import { FetchRecentQuestionsUseCase } from "./fetch-recent-questions";

describe("Fetch Recent Questions [Use Case]", () => {
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: FetchRecentQuestionsUseCase;

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );

    sut = new FetchRecentQuestionsUseCase(questionsRepository);

    vi.spyOn(questionsRepository, "findManyRecent");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be able the fetch recent questions", async () => {
    // prepare
    questionsRepository.create(
      makeQuestion({ createdAt: new Date(2024, 0, 14, 10, 0, 0) }),
    );
    questionsRepository.create(
      makeQuestion({ createdAt: new Date(2024, 0, 16, 10, 0, 0) }),
    );
    questionsRepository.create(
      makeQuestion({ createdAt: new Date(2024, 0, 15, 10, 0, 0) }),
    );

    // act
    const result = await sut.execute({ page: 1, pageSize: 10 });

    const page = result.unwrap();

    // assert
    expect(page.items).toEqual([
      expect.objectContaining({ createdAt: new Date(2024, 0, 16, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 15, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 14, 10, 0, 0) }),
    ]);

    expect(questionsRepository.findManyRecent).toHaveBeenCalledTimes(1);
  });

  it("should be able the fetch recent questions with pagination", async () => {
    // prepare
    await makeMany(
      () =>
        questionsRepository.create(
          makeQuestion({
            createdAt: new Date(2024, 0, 14, 10, 0, 0),
          }),
        ),
      29,
    );

    // act
    const result1 = await sut.execute({ page: 1, pageSize: 10 });

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

    expect(questionsRepository.findManyRecent).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 10,
    });

    // act
    const result2 = await sut.execute({ page: 2, pageSize: 15 });

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

    expect(questionsRepository.findManyRecent).toHaveBeenNthCalledWith(2, {
      page: 2,
      pageSize: 15,
    });
  });
});
