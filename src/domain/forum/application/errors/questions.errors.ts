import { DomainError } from "@domain/core/errors/core-error";

export class QuestionNotFound extends DomainError.NotFound {
  constructor() {
    super(QuestionNotFound.name, "Question not found");
  }
}

export class QuestionDeletionNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      QuestionDeletionNotAllowed.name,
      "You are not allowed to delete this question",
    );
  }
}

export class QuestionModificationNotAllowed extends DomainError.NotAllowed {
  constructor() {
    super(
      QuestionModificationNotAllowed.name,
      "You are not allowed to modify this question",
    );
  }
}
