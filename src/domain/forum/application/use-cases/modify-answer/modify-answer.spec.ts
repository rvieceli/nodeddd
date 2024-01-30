import { makeAnswer } from "@test/factories/make-answer";
import { makeAnswerAttachment } from "@test/factories/make-answer-attachment";
import { makeMany } from "@test/factories/make-many";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { text } from "@domain/forum/enterprise/entities/value-objects/text";

import { AnswerNotFound } from "../../errors/answers.errors";
import { AnswerModificationNotAllowed } from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";

import { ModifyAnswerUseCase } from "./modify-answer";

describe("Modify Answer [Use Case]", () => {
  let answersRepository: AnswersRepository;
  let answerAttachmentsRepository: AnswerAttachmentsRepository;
  let sut: ModifyAnswerUseCase;

  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentsRepository,
    );
    sut = new ModifyAnswerUseCase(
      answersRepository,
      answerAttachmentsRepository,
    );

    vi.spyOn(answersRepository, "save");
    vi.spyOn(answerAttachmentsRepository, "findManyByAnswerId");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to modify an answer", async () => {
    // prepare
    const authorId = UniqueId.create();

    const original = makeAnswer({
      content: text`Old content`,
      authorId,
    });

    await answersRepository.create(original);

    // act
    const result = await sut.execute({
      actorId: authorId.getId(),
      answerId: original.getId(),
      data: {
        content: "New content",
      },
    });

    const { answer: updated } = result.unwrap();

    // assert
    expect(original).not.toMatchObject(updated);
    expect(updated).toMatchObject({
      props: {
        content: text`New content`,
      },
    });
    expect(answersRepository.save).toHaveBeenNthCalledWith(1, updated);
    expect(
      answerAttachmentsRepository.findManyByAnswerId,
    ).not.toHaveBeenCalled();
  });

  describe("when the answer has attachments", () => {
    it("should be able to update the attachments", async () => {
      // prepare
      const authorId = UniqueId.create();

      const original = makeAnswer({
        content: text`Old content`,
        authorId,
      });

      await answersRepository.create(original);

      const attachments = await makeMany(async () => {
        const answerAttachment = makeAnswerAttachment({
          answerId: original.id,
        });
        await answerAttachmentsRepository.create(answerAttachment);
        return answerAttachment;
      }, 3);

      const attachmentId = attachments[1].attachmentId.getId();

      // act
      const result = await sut.execute({
        actorId: authorId.getId(),
        answerId: original.getId(),
        data: {
          content: "New content",
          attachmentIds: [attachmentId],
        },
      });

      const { answer: updated } = result.unwrap();

      // assert
      expect(original).not.toMatchObject(updated);
      expect(updated.attachments?.currentItems).toHaveLength(1);
      expect(updated).toMatchObject({
        props: {
          content: text`New content`,
        },
      });
      expect(answersRepository.save).toHaveBeenNthCalledWith(1, updated);
      expect(
        answerAttachmentsRepository.findManyByAnswerId,
      ).toHaveBeenNthCalledWith(1, original.getId());
    });

    it("should not update the attachments if not passed a new one (0..n)", async () => {
      // prepare
      const authorId = UniqueId.create();

      const original = makeAnswer({
        content: text`Old content`,
        authorId,
      });

      await answersRepository.create(original);

      await makeMany(async () => {
        const answerAttachment = makeAnswerAttachment({
          answerId: original.id,
        });
        await answerAttachmentsRepository.create(answerAttachment);
        return answerAttachment;
      }, 3);

      // act
      const result = await sut.execute({
        actorId: authorId.getId(),
        answerId: original.getId(),
        data: {
          content: "New content",
        },
      });

      const { answer: updated } = result.unwrap();

      // assert
      expect(original).not.toMatchObject(updated);
      expect(updated).toMatchObject({
        props: {
          content: text`New content`,
        },
      });

      expect(updated.attachments).toBeUndefined();

      expect(answersRepository.save).toHaveBeenNthCalledWith(1, updated);
      expect(
        answerAttachmentsRepository.findManyByAnswerId,
      ).not.toHaveBeenCalled();

      const attachments = await answerAttachmentsRepository.findManyByAnswerId(
        original.getId(),
      );

      expect(attachments).toHaveLength(3);
    });

    it("should remove all attachments if passed an empty array", async () => {
      // prepare
      const authorId = UniqueId.create();

      const original = makeAnswer({
        content: text`Old content`,
        authorId,
      });

      await answersRepository.create(original);

      await makeMany(async () => {
        const answerAttachment = makeAnswerAttachment({
          answerId: original.id,
        });
        await answerAttachmentsRepository.create(answerAttachment);
        return answerAttachment;
      }, 3);

      // act
      const result = await sut.execute({
        actorId: authorId.getId(),
        answerId: original.getId(),
        data: {
          attachmentIds: [],
        },
      });

      const { answer: updated } = result.unwrap();

      // assert
      expect(original).not.toMatchObject(updated);
      expect(updated).toMatchObject({
        props: {
          content: text`Old content`,
        },
      });

      expect(updated.attachments?.currentItems).toEqual([]);

      expect(answersRepository.save).toHaveBeenNthCalledWith(1, updated);
      expect(
        answerAttachmentsRepository.findManyByAnswerId,
      ).toHaveBeenNthCalledWith(1, original.getId());

      const attachments = await answerAttachmentsRepository.findManyByAnswerId(
        original.getId(),
      );

      expect(attachments).toHaveLength(0);
    });
  });

  describe("when the answer cannot be modified", () => {
    it("should throw an error if actor is not the author", async () => {
      // prepare
      const authorId = UniqueId.create();

      const answer = makeAnswer({
        content: text`Old content`,
        authorId,
      });

      await answersRepository.create(answer);

      const answerId = answer.getId();
      const actorId = UniqueId.getId();

      // act
      const result = await sut.execute({
        actorId,
        answerId,
        data: {
          content: "New content",
        },
      });

      // assert
      expect(authorId.getId()).not.toBe(actorId);

      expect(result.value).toBeInstanceOf(AnswerModificationNotAllowed);

      expect(answersRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if answer does not exist", async () => {
      // prepare
      const answerId = UniqueId.getId();
      const actorId = UniqueId.getId();

      // act
      const result = await sut.execute({
        answerId,
        actorId,
        data: {
          content: "New content",
        },
      });

      // assert
      expect(result.value).toBeInstanceOf(AnswerNotFound);

      expect(answersRepository.save).not.toHaveBeenCalled();
    });
  });
});
