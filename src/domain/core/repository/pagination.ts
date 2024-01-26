export interface PaginatedRequest {
  page: number;
  pageSize: number;
}

export class PaginatedResponse<Entity> {
  private constructor(
    public readonly items: Entity[],
    public readonly page: number,
    public readonly pageSize: number,
    public readonly total: number,
    public readonly totalPages: number,
  ) {}

  static create<Entity>({
    items,
    total,
    page,
    pageSize,
  }: {
    items: Entity[];
    total: number;
    page: number;
    pageSize: number;
  }) {
    return new PaginatedResponse<Entity>(
      items,
      page,
      pageSize,
      total,
      Math.ceil(total / pageSize),
    );
  }
}
