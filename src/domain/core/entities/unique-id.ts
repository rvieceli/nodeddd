import { randomUUID } from "crypto";

import { Entity } from "./entity";

export type PrimitiveUniqueId = string;

export class UniqueId {
  private _value: PrimitiveUniqueId;

  private constructor(value?: PrimitiveUniqueId) {
    this._value = value ?? randomUUID();
  }

  static create(value?: PrimitiveUniqueId) {
    return new UniqueId(value);
  }

  static getId() {
    return this.create().getId();
  }

  toString() {
    return this._value;
  }

  toValue(): PrimitiveUniqueId {
    return this._value;
  }

  getId() {
    return this._value;
  }

  equals(id: UniqueId | Entity<unknown> | PrimitiveUniqueId) {
    if (id instanceof UniqueId) return this._value === id._value;

    if (id instanceof Entity) return this._value === id.getId();

    return this._value === id;
  }
}
