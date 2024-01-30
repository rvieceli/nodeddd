import { Text, text } from "./text";

describe("Text [Value Object]", () => {
  it("should be defined", () => {
    const val = Text.create("test");

    expect(val).toBeDefined();
    expect(val.value).toBe("test");
  });

  it("should be equal to another text", () => {
    const val = Text.create("test");
    const val2 = Text.create("test");

    expect(val.equals(val2.value)).toBe(true);
  });

  it("should not be equal to another text", () => {
    const val = Text.create("test");
    const val2 = Text.create("test2");

    expect(val.equals(val2.value)).toBe(false);
  });

  it("should return an excerpt", () => {
    const val = Text.create("test of something");

    expect(val.excerpt(10)).toBe("test of...");
    expect(val.excerpt(100)).toBe("test of something");
    expect(val.excerpt(16)).toBe("test of somet...");
  });

  it("tag function should return Text instance", () => {
    const val1 = Text.create("test");
    const literals = text`test`;

    expect(val1).toBeInstanceOf(Text);
    expect(literals).toBeInstanceOf(Text);
    expect(val1).not.toBe(literals);
    expect(val1.equals(literals.value)).toBe(true);
  });
});
