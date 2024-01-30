import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { text } from "@domain/forum/enterprise/entities/value-objects/text";

import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";

import { CreateQuestionUseCase } from "./create-question";

describe("Create Question [UseCase]", () => {
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: CreateQuestionUseCase;

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );

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

    expect(question).toMatchObject(
      expect.objectContaining({
        title: text`New question`,
        content: text`New question content`,
      }),
    );

    expect(questionsRepository.create).toHaveBeenNthCalledWith(1, question);
  });

  it("should be able to create a with attachments", async () => {
    // prepare
    const attachmentIds = [UniqueId.getId(), UniqueId.getId()];

    // act
    const result = await sut.execute({
      authorId: "1",
      title: "New question",
      content: "New question content",
      attachmentIds,
    });

    // assert
    const { question } = result.unwrap();

    expect(question.attachments?.currentItems).toMatchObject(
      attachmentIds.map((id) => ({
        attachmentId: UniqueId.create(id),
        questionId: question.id,
      })),
    );

    const persisted = await questionsRepository.findById(question.getId());

    expect(persisted).not.toBe(question);
    expect(persisted).toMatchObject(question);

    expect(questionsRepository.create).toHaveBeenNthCalledWith(1, question);
  });
});
