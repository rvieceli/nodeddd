import { AggregateRoot } from "../entities/aggregate-root";
import { DomainEvent } from "./domain-event";
import { DomainEvents } from "./domain-events";

describe("DomainEvents", () => {
  class DummyAggregateCreatedEvent implements DomainEvent {
    occurredAt: Date;

    constructor(private aggregate: DummyAggregate) {
      this.occurredAt = new Date();
    }
  }

  class DummyAggregate extends AggregateRoot<unknown> {
    static create() {
      const instance = new DummyAggregate({});
      instance.addDomainEvent(new DummyAggregateCreatedEvent(instance));
      return instance;
    }
  }

  it("should be able to dispatch and listen to events", async () => {
    const listener = vi.fn();

    DomainEvents.register(listener, DummyAggregateCreatedEvent.name);

    const aggregate = DummyAggregate.create();

    expect(aggregate.domainEvents).toHaveLength(1);

    DomainEvents.dispatchEventsFor(aggregate.id);

    expect(listener).toHaveBeenCalledOnce();
    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
