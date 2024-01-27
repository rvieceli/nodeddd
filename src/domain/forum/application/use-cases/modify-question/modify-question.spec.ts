import { makeMany } from "@test/factories/make-many";
import { makeQuestion } from "@test/factories/make-question";
import { makeQuestionAttachment } from "@test/factories/make-question-attachment";

import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";
import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  QuestionNotFound,
  QuestionModificationNotAllowed,
} from "../../errors/questions.errors";

import { QuestionsRepository } from "../../repositories/questions.repository";
import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";

import { ModifyQuestionUseCase } from "./modify-question";

describe("Modify Question [Use Case]", () => {
  let questionsRepository: QuestionsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: ModifyQuestionUseCase;

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );
    sut = new ModifyQuestionUseCase(
      questionsRepository,
      questionAttachmentsRepository,
    );

    vi.spyOn(questionsRepository, "save");
    vi.spyOn(questionAttachmentsRepository, "findManyByQuestionId");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to modify a question", async () => {
    // prepare
    const authorId = UniqueId.create();

    const original = makeQuestion({
      content: "Old content",
      title: "Old title",
      authorId,
    });

    await questionsRepository.create(original);

    // act
    const result = await sut.execute({
      actorId: authorId.getId(),
      questionId: original.getId(),
      data: {
        content: "New content",
        title: "New title",
      },
    });

    const { question: updated } = result.unwrap();

    // assert
    expect(original).not.toMatchObject(updated);
    expect(updated).toMatchObject({
      props: {
        content: "New content",
        title: "New title",
      },
    });
    expect(questionsRepository.save).toHaveBeenNthCalledWith(1, updated);
    expect(
      questionAttachmentsRepository.findManyByQuestionId,
    ).not.toHaveBeenCalled();
  });

  describe("when the question has attachments", () => {
    it("should be able to update the attachments", async () => {
      // prepare
      const authorId = UniqueId.create();

      const original = makeQuestion({
        content: "Old content",
        title: "Old title",
        authorId,
      });

      await questionsRepository.create(original);

      const attachments = await makeMany(async () => {
        const questionAttachment = makeQuestionAttachment({
          questionId: original.id,
        });
        await questionAttachmentsRepository.create(questionAttachment);
        return questionAttachment;
      }, 3);

      const attachmentId = attachments[1].attachmentId.getId();

      // act
      const result = await sut.execute({
        actorId: authorId.getId(),
        questionId: original.getId(),
        data: {
          title: "New title",
          attachmentIds: [attachmentId],
        },
      });

      const { question: updated } = result.unwrap();

      // assert
      expect(original).not.toMatchObject(updated);
      expect(updated).toMatchObject({
        props: {
          title: "New title",
        },
      });

      expect(updated.attachments?.currentItems).toHaveLength(1);

      expect(questionsRepository.save).toHaveBeenNthCalledWith(1, updated);
      expect(
        questionAttachmentsRepository.findManyByQuestionId,
      ).toHaveBeenNthCalledWith(1, original.getId());
    });

    it("should not update the attachments if not passed a new one (0..n)", async () => {
      // prepare
      const authorId = UniqueId.create();

      const original = makeQuestion({
        content: "Old content",
        title: "Old title",
        authorId,
      });

      await questionsRepository.create(original);

      await makeMany(async () => {
        const questionAttachment = makeQuestionAttachment({
          questionId: original.id,
        });
        await questionAttachmentsRepository.create(questionAttachment);
        return questionAttachment;
      }, 3);

      // act
      const result = await sut.execute({
        actorId: authorId.getId(),
        questionId: original.getId(),
        data: {
          title: "New title",
        },
      });

      const { question: updated } = result.unwrap();

      // assert
      expect(original).not.toMatchObject(updated);
      expect(updated).toMatchObject({
        props: {
          title: "New title",
        },
      });

      expect(updated.attachments).toBeUndefined();

      expect(questionsRepository.save).toHaveBeenNthCalledWith(1, updated);
      expect(
        questionAttachmentsRepository.findManyByQuestionId,
      ).not.toHaveBeenCalled();

      const attachments =
        await questionAttachmentsRepository.findManyByQuestionId(
          original.getId(),
        );

      expect(attachments).toHaveLength(3);
    });
  });

  describe("when the question can't be modified [ERROR]", () => {
    it("should result an error if actor is not the author", async () => {
      // prepare
      const authorId = UniqueId.create();

      const question = makeQuestion({
        content: "Old content",
        title: "Old title",
        authorId,
      });

      await questionsRepository.create(question);

      const questionId = question.getId();
      const actorId = UniqueId.getId();

      // act
      const result = await sut.execute({
        actorId,
        questionId,
        data: {
          title: "New title",
        },
      });

      // assert
      expect(authorId.getId()).not.toBe(actorId);
      expect(result.value).toBeInstanceOf(QuestionModificationNotAllowed);
      expect(questionsRepository.save).not.toHaveBeenCalled();
    });

    it("should result an error if question does not exist", async () => {
      // prepare
      const questionId = UniqueId.getId();
      const actorId = UniqueId.getId();

      // act
      const result = await sut.execute({
        questionId,
        actorId,
        data: {
          title: "New title",
        },
      });

      // assert
      expect(result.value).toBeInstanceOf(QuestionNotFound);
      expect(questionsRepository.save).not.toHaveBeenCalled();
    });
  });
});
