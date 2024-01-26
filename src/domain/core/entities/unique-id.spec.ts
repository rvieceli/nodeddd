import { randomUUID } from "crypto";

import { Entity } from "./entity";
import { PrimitiveUniqueId, UniqueId } from "./unique-id";

describe("Unique ID [Value Object]", () => {
  let randomValue: PrimitiveUniqueId;

  class Dummy extends Entity<{ name: string }> {
    static create(props: { name: string }, id?: UniqueId) {
      return new Dummy(props, id);
    }

    get name() {
      return this.props.name;
    }
  }

  beforeEach(() => {
    randomValue = randomUUID();
  });

  it("should create a unique id", () => {
    const id = UniqueId.create();

    expect(id).toBeDefined();
  });

  it("should create a unique id with a given value", () => {
    const id = UniqueId.create(randomValue);

    expect(id).toBeDefined();
    expect(id.getId()).toBe(randomValue);
  });

  describe("getters", () => {
    it("should convert a unique id to string", () => {
      const id = UniqueId.create(randomValue);

      expect(id.toString()).toBe(randomValue);
    });

    it("should convert a unique id to value", () => {
      const id = UniqueId.create(randomValue);

      expect(id.toValue()).toBe(randomValue);
    });

    it("should get the id", () => {
      const id = UniqueId.create(randomValue);

      expect(id.getId()).toBe(randomValue);
    });
  });

  describe("equals", () => {
    it("should compare against another UniqueID", () => {
      const id1 = UniqueId.create(randomValue);
      const id2 = UniqueId.create(randomValue);
      const id3 = UniqueId.create();

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });

    it("should compare against an Entity", () => {
      const id1 = UniqueId.create(randomValue);
      const id2 = UniqueId.create(randomValue);

      const dummy1 = Dummy.create({ name: "dummy" }, id2);
      const dummy2 = Dummy.create({ name: "dummy" });

      expect(id1.equals(dummy1)).toBe(true);
      expect(id1.equals(dummy2)).toBe(false);
    });

    it("should compare against a primitive value", () => {
      const id1 = UniqueId.create(randomValue);
      const otherValue = randomUUID();

      expect(id1.equals(randomValue)).toBe(true);
      expect(id1.equals(otherValue)).toBe(false);
    });
  });
});
