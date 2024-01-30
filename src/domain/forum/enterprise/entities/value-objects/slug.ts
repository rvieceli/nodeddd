import { ValueObject } from "@domain/core/entities/value-object";
import { Text } from "./text";

export class Slug extends ValueObject<string> {
  equals(value: string): boolean {
    return this._value === value;
  }

  /**
   * Receives a string and and id and normalizes it to a slug.
   *
   * example: "This is a slug" -> "this-is-a-slug"
   *
   * @param text string
   * @param id string
   * @returns Slug
   */
  static fromString(text: string | Text): Slug {
    const _text = text instanceof Text ? text.value : text;

    const slug = _text
      .normalize("NFKD")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/_/g, "-")
      .replace(/--/g, "-")
      .replace(/-$/g, "-");

    return new Slug(slug);
  }
}
