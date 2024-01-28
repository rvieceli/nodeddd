import { UniqueId } from "../entities/unique-id";

export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): UniqueId;
}
