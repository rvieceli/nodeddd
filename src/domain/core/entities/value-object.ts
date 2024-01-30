export abstract class ValueObject<T> {
  protected readonly _value: T;

  protected constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  toString(): string {
    return String(this._value);
  }

  toValue(): T {
    return this._value;
  }

  abstract equals(value: T): boolean;
}
