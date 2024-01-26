import { DomainError } from "@domain/core/errors/core-error";

export class AnswerNotFound extends DomainError.NotFound {
  constructor() {
    super(AnswerNotFound.name, "Answer not found");
  }
}

export class AnswerDeletionNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      AnswerDeletionNotAllowed.name,
      "You are not allowed to delete this answer",
    );
  }
}
export class AnswerModificationNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      AnswerModificationNotAllowed.name,
      "You are not allowed to modify this answer",
    );
  }
}
