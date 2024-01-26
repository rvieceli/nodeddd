import { Result } from "./result";

describe("Result [Core]", () => {
  function dummyWillError(shouldError: boolean): Result<number, Error> {
    if (shouldError) {
      return Result.fail(new Error("fail"));
    }

    return Result.ok(19);
  }

  test("success result", () => {
    const result = dummyWillError(false);

    expect(result.isOk()).toBe(true);
    expect(result.isFail()).toBe(false);
    expect(result.value).toBe(19);
  });

  test("fail result", () => {
    const result = dummyWillError(true);

    expect(result.isOk()).toBe(false);
    expect(result.isFail()).toBe(true);
    expect(result.value).toEqual(new Error("fail"));
  });
});
