import { randomUUID } from "crypto";

export type PrimitiveUniqueId = string;

interface AnyWithGetId {
  getId(): PrimitiveUniqueId;
}

function isAnyWithGetId(instance: unknown): instance is AnyWithGetId {
  return !!instance && typeof instance === "object" && "getId" in instance;
}

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

  equals(instance: UniqueId | AnyWithGetId | PrimitiveUniqueId) {
    if (instance instanceof UniqueId) return this._value === instance._value;
    if (isAnyWithGetId(instance)) return this._value === instance.getId();
    return this._value === instance;
  }
}
