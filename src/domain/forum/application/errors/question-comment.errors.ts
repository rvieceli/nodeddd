import { DomainError } from "@domain/core/errors/core-error";

export class QuestionCommentNotFound extends DomainError.NotFound {
  constructor() {
    super(QuestionCommentNotFound.name, "Question comment not found");
  }
}
export class QuestionCommentDeletionNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      QuestionCommentDeletionNotAllowed.name,
      "You are not allowed to delete this question comment",
    );
  }
}
export class QuestionCommentModificationNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      QuestionCommentModificationNotAllowed.name,
      "You are not allowed to modify this question comment",
    );
  }
}
