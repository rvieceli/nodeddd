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

  // get<T extends keyof Props>(key: T): Props[T] {
  //   return this.props[key];
  // }

  // protected set<T extends keyof Props>(key: T, value: Props[T]): void {
  //   this.props[key] = value;
  // }
}
