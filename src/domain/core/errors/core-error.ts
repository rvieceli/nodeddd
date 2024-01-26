enum ErrorType {
  Failure,
  Validation,
  NotFound,
  NotAllowed,
  Conflict,
}

class CoreError extends Error {
  readonly code: string;
  readonly type: ErrorType;

  protected constructor(code: string, message: string, type: ErrorType) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

class NotFound extends CoreError {
  constructor(code: string, message: string) {
    super(code, message, ErrorType.NotFound);
  }
}

class NotAllowed extends CoreError {
  constructor(code: string, message: string) {
    super(code, message, ErrorType.NotFound);
  }
}

class Validation extends CoreError {
  constructor(code: string, message: string) {
    super(code, message, ErrorType.NotFound);
  }
}

class Conflict extends CoreError {
  constructor(code: string, message: string) {
    super(code, message, ErrorType.NotFound);
  }
}

class Failure extends CoreError {
  constructor(code: string, message: string) {
    super(code, message, ErrorType.NotFound);
  }
}

export const DomainError = {
  ErrorType,
  NotFound,
  NotAllowed,
  Validation,
  Conflict,
  Failure,
} as const;
