import { DomainError } from "@domain/core/errors/core-error";

export class AnswerCommentNotFound extends DomainError.NotFound {
  constructor() {
    super("AnswerComment.NotFound", "Answer comment not found");
  }
}
export class AnswerCommentDeletionNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      AnswerCommentDeletionNotAllowed.name,
      "You are not allowed to delete this answer comment",
    );
  }
}
export class AnswerCommentModificationNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      AnswerCommentModificationNotAllowed.name,
      "You are not allowed to modify this answer comment",
    );
  }
}
