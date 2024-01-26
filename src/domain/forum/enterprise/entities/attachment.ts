import { Entity } from "@domain/core/entities/entity";
import { UniqueId } from "@domain/core/entities/unique-id";

interface AttachmentProps {
  title: string;
  link: string;
}

export class Attachment extends Entity<AttachmentProps> {
  static create(props: AttachmentProps, id?: UniqueId): Attachment {
    return new Attachment(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get link(): string {
    return this.props.link;
  }
}
