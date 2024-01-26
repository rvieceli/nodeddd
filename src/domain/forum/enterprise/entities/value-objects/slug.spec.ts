import { Slug } from "./slug";

describe("Slug", () => {
  it.each([
    ["This is a slug", "this-is-a-slug"],
    ["Is this a slug?", "is-this-a-slug"],
    ["is-this-a-slug", "is-this-a-slug"],
  ])('should normalize "%s" a string to a slug "%s"', (value, expected) => {
    const slug = Slug.fromString(value);

    expect(slug.equals(expected)).toBe(true);
    expect(slug.value).toBe(expected);
  });
});
