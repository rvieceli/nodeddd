import { makeQuestion } from "@test/factories/make-question";

import { InMemoryQuestionAttachmentsRepository } from "@test/repositories/in-memory.question-attachments.repository";
import { InMemoryQuestionCommentsRepository } from "@test/repositories/in-memory.question-comments.repository";
import { InMemoryQuestionsRepository } from "@test/repositories/in-memory.questions.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { QuestionComment } from "@domain/forum/enterprise/entities/question-comment";
import { text } from "@domain/forum/enterprise/entities/value-objects/text";

import { QuestionNotFound } from "../../errors/questions.errors";

import { QuestionAttachmentsRepository } from "../../repositories/question-attachments.repository";
import { QuestionCommentsRepository } from "../../repositories/question-comments.repository";
import { QuestionsRepository } from "../../repositories/questions.repository";

import { CommentOnQuestionUseCase } from "./comment-on-question";

describe("Comment on Question [Use Case]", () => {
  let questionsRepository: QuestionsRepository;
  let commentsRepository: QuestionCommentsRepository;
  let questionAttachmentsRepository: QuestionAttachmentsRepository;
  let sut: CommentOnQuestionUseCase;

  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    );

    commentsRepository = new InMemoryQuestionCommentsRepository();
    sut = new CommentOnQuestionUseCase(questionsRepository, commentsRepository);

    vi.spyOn(questionsRepository, "findById");
    vi.spyOn(commentsRepository, "create");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should be able to create a comment", async () => {
    //prepare
    const question = makeQuestion();

    await questionsRepository.create(question);

    const questionId = question.getId();
    const actorId = UniqueId.getId();

    //act
    const result = await sut.execute({
      questionId,
      actorId,
      content: "This is a comment",
    });

    const { comment } = result.unwrap();

    //assert
    expect(comment).toBeInstanceOf(QuestionComment);
    expect(comment).toMatchObject({
      content: text`This is a comment`,
      questionId: question.id,
      authorId: UniqueId.create(actorId),
    });

    expect(questionsRepository.findById).toHaveBeenNthCalledWith(1, questionId);
    expect(commentsRepository.create).toHaveBeenNthCalledWith(1, comment);
  });

  it("should throw an error when answer does not exist", async () => {
    //prepare
    const actorId = UniqueId.getId();
    const questionId = UniqueId.getId();

    //act
    const result = await sut.execute({
      actorId,
      questionId,
      content: "This is a comment",
    });

    //assert
    expect(result.value).toBeInstanceOf(QuestionNotFound);

    expect(questionsRepository.findById).toHaveBeenNthCalledWith(1, questionId);
    expect(commentsRepository.create).not.toHaveBeenCalled();
  });
});
