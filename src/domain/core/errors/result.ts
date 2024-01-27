export class Result<Ok, Fail> {
  private readonly _ok: boolean;
  private readonly _value: Ok | Fail;

  private constructor(ok: true, value?: Ok);
  private constructor(ok: false, error: Fail);
  private constructor(ok: boolean, valueOrError: Ok | Fail) {
    this._ok = ok;
    this._value = valueOrError;
  }

  get value() {
    return this._value;
  }

  static ok(): Result<void, never>;
  static ok<Ok>(data: Ok): Result<Ok, never>;
  static ok<Ok>(data?: Ok): Result<Ok, never> {
    return new Result(true, data);
  }

  static fail<Fail>(error: Fail): Result<never, Fail> {
    return new Result(false, error);
  }

  isOk(): this is Result<Ok, never> {
    return this._ok;
  }

  isFail(): this is Result<never, Fail> {
    return !this._ok;
  }

  unwrap(): Ok {
    if (this.isOk()) {
      return this._value;
    }

    throw this._value;
  }
}
