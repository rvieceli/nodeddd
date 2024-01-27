import { Entity as EntityBase } from "@domain/core/entities/entity";
import { type PrimitiveUniqueId } from "@domain/core/entities/unique-id";
import {
  PaginatedRequest,
  PaginatedResponse,
} from "@domain/core/repository/pagination";

export abstract class InMemory<Entity extends EntityBase<unknown>> {
  constructor() {
    if (process.env.NODE_ENV === "production")
      throw new Error("Cannot use this repository in production");
  }

  protected store: Entity[] = [];

  abstract clone(base: Entity): Entity;

  protected push(item: Entity): void {
    this.store.push(this.clone(item));
  }

  protected find(predicate: (item: Entity) => boolean): Entity | undefined {
    const item = this.store.find(predicate);

    if (item) {
      return this.clone(item);
    }
  }

  protected filter(predicate: (item: Entity) => boolean): Entity[] {
    return this.store.filter(predicate).map((item) => this.clone(item));
  }

  protected replace(replacing: Entity): void {
    const index = this.store.findIndex((item) => item.id.equals(replacing));

    if (index === -1)
      throw new Error(
        "InMemory: Trying to replace an item that does not exist",
      );

    this.store[index] = this.clone(replacing);
  }

  protected remove(predicate: (item: Entity) => boolean): void {
    this.store = this.store.filter((item) => !predicate(item));
  }

  async create(answer: Entity): Promise<void> {
    this.push(answer);
  }

  async save(answer: Entity): Promise<void> {
    this.replace(answer);
  }

  async delete(deleting: Entity): Promise<void> {
    this.remove((answer) => answer.id.equals(deleting));
  }

  async findById(id: PrimitiveUniqueId): Promise<Entity | undefined> {
    return this.find((answer) => answer.id.equals(id));
  }

  protected paginationToSlice(pagination: PaginatedRequest): [number, number] {
    return [
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize,
    ];
  }

  protected paginate(
    allItems: Entity[],
    pagination: PaginatedRequest,
  ): PaginatedResponse<Entity> {
    const items = allItems.slice(...this.paginationToSlice(pagination));

    return PaginatedResponse.create({
      items,
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: allItems.length,
    });
  }

  protected removeUndefined<T>(values: T): T {
    for (const key in values) {
      if (values[key] === undefined) {
        delete values[key];
      }
    }
    return values;
  }
}
