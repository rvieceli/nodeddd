import { type AggregateRoot } from "../entities/aggregate-root";
import { UniqueId } from "../entities/unique-id";
import { DomainEvent } from "./domain-event";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DomainEventCallback<T extends DomainEvent> = (event: T) => Promise<void>;

export class DomainEvents {
  private static handlersMap: Record<
    string,
    DomainEventCallback<DomainEvent>[]
  > = {};
  private static marked: AggregateRoot<unknown>[] = [];

  public static add(entity: AggregateRoot<unknown>) {
    const found = !!this.findMarkedByID(entity.id);

    if (found) return;

    this.marked.push(entity);
  }

  private static findMarkedByID(id: UniqueId) {
    return this.marked.find((entity) => entity.id.equals(id));
  }

  private static dispatchEvents(entity: AggregateRoot<unknown>) {
    entity.domainEvents.map((event) => this.dispatch(event));
  }

  static dispatch<T extends DomainEvent>(event: T) {
    const eventClassName = event.constructor.name;

    const isEventRegistered = eventClassName in this.handlersMap;

    if (!isEventRegistered) return;

    const handlers = this.handlersMap[eventClassName];

    for (const handler of handlers) {
      handler(event);
    }
  }

  private static removeFromMarkedDispatchList(entity: AggregateRoot<unknown>) {
    const index = this.marked.findIndex((a) => a.equals(entity));

    this.marked.splice(index, 1);
  }

  public static dispatchEventsFor(id: UniqueId) {
    const entity = this.findMarkedByID(id);

    if (!entity) return;

    this.dispatchEvents(entity);
    entity.clearEvents();
    this.removeFromMarkedDispatchList(entity);
  }

  public static register<T extends DomainEvent>(
    handler: DomainEventCallback<T>,
    eventClassName: string,
  ) {
    const wasEventAlreadyRegistered = eventClassName in this.handlersMap;

    if (!wasEventAlreadyRegistered) {
      this.handlersMap[eventClassName] = [];
    }

    this.handlersMap[eventClassName].push(
      handler as DomainEventCallback<DomainEvent>,
    );
  }

  public static clearHandlers() {
    this.handlersMap = {};
  }

  public static clearMarked() {
    this.marked = [];
  }
}
