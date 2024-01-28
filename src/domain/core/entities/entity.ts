import { UniqueId } from "./unique-id";

export abstract class Entity<Props> {
  private _id: UniqueId;

  protected props: Props;

  protected constructor(props: Props, id?: UniqueId) {
    this.props = props;
    this._id = id ?? UniqueId.create();
  }

  get id() {
    return this._id;
  }

  getId() {
    return this._id.getId();
  }

  equals(entity: Entity<Props>): boolean {
    if (this === entity) return true;

    return this._id.equals(entity);
  }

  // get<T extends keyof Props>(key: T): Props[T] {
  //   return this.props[key];
  // }

  // protected set<T extends keyof Props>(key: T, value: Props[T]): void {
  //   this.props[key] = value;
  // }
}
