import { makeAnswer } from "@test/factories/make-answer";

import { InMemoryAnswersRepository } from "@test/repositories/in-memory.answers.repository";
import { InMemoryAnswerAttachmentsRepository } from "@test/repositories/in-memory.answers-attachments.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import {
  AnswerNotFound,
  AnswerDeletionNotAllowed,
} from "../../errors/answers.errors";

import { AnswersRepository } from "../../repositories/answers.repository";
import { AnswerAttachmentsRepository } from "../../repositories/answer-attachments.repository";

import { DeleteAnswerUseCase } from "./delete-answer";

describe("Delete Answer [Use Case]", () => {
  let answersRepository: AnswersRepository;
  let answerAttachmentsRepository: AnswerAttachmentsRepository;
  let sut: DeleteAnswerUseCase;

  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentsRepository,
    );
    sut = new DeleteAnswerUseCase(answersRepository);

    vi.spyOn(answersRepository, "delete");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should delete a answer", async () => {
    //prepare
    const authorId = UniqueId.create();
    const answer = makeAnswer({
      authorId,
    });

    await answersRepository.create(answer);

    const answerId = answer.getId();
    const actorId = authorId.getId();

    //act
    const result = await sut.execute({ answerId, actorId });

    //assert
    expect(result.isOk()).toBe(true);

    const deleted = await answersRepository.findById(answerId);

    expect(deleted).toBeUndefined();
    expect(answersRepository.delete).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: answer.id }),
    );
  });

  it("should throw an error if actor is not the author", async () => {
    //prepare
    const authorId = UniqueId.create();
    const answer = makeAnswer({
      authorId,
    });

    await answersRepository.create(answer);

    const answerId = answer.getId();
    const actorId = UniqueId.getId();

    expect(authorId.getId()).not.toBe(actorId);

    //act
    const result = await sut.execute({ answerId, actorId });

    //assert
    expect(result.value).toBeInstanceOf(AnswerDeletionNotAllowed);

    expect(answersRepository.delete).not.toHaveBeenCalled();
  });

  it("should throw an error if answer does not exist", async () => {
    //prepare
    const answerId = UniqueId.getId();
    const actorId = UniqueId.getId();

    //act
    const result = await sut.execute({ answerId, actorId });

    //assert
    expect(result.value).toBeInstanceOf(AnswerNotFound);

    expect(answersRepository.delete).not.toHaveBeenCalled();
  });
});
