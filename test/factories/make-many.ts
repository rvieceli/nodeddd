export async function makeMany<T>(
  factory: (index: number) => Promise<T>,
  count: number,
): Promise<T[]> {
  return Promise.all(
    Array.from({ length: count }).map(async (_, index) => factory(index)),
  );
}
