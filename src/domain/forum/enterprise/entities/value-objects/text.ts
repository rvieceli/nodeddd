import { ValueObject } from "@domain/core/entities/value-object";

const EXCERPT_LENGTH = 120;

export class Text extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  equals(value: string): boolean {
    return this._value === value;
  }

  excerpt(length = EXCERPT_LENGTH): string {
    if (this._value.length <= length) return this._value;

    return this._value.slice(0, length - 3).trim() + "...";
  }

  static create(text: string): Text {
    return new Text(text);
  }
}

export function text<T>(template: TemplateStringsArray, ...substitutions: T[]) {
  const string = String.raw(template, ...substitutions);

  return Text.create(string);
}
