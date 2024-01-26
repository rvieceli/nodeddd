export class Slug {
  private _value: string;

  constructor(text: string) {
    this._value = text;
  }

  get value(): string {
    return this._value;
  }

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
  static fromString(text: string): Slug {
    const slug = text
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
