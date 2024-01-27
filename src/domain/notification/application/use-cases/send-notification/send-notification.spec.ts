import { InMemoryNotificationsRepository } from "@test/repositories/in-memory.notifications.repository";

import { UniqueId } from "@domain/core/entities/unique-id";

import { NotificationsRepository } from "../../repositories/notifications.repository";

import { SendNotificationUseCase } from "./send-notification";

describe("SendNotification [Use Case]", () => {
  let notificationsRepository: NotificationsRepository;
  let sut: SendNotificationUseCase;

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository();
    sut = new SendNotificationUseCase(notificationsRepository);

    vi.spyOn(notificationsRepository, "create");
  });

  it("should send a notification", async () => {
    // prepare
    const recipientId = UniqueId.getId();

    // act
    const result = await sut.execute({
      recipientId,
      title: "title",
      content: "content",
    });

    const { notification } = result.unwrap();

    // assert
    expect(notification).toMatchObject({
      recipientId: UniqueId.create(recipientId),
      title: "title",
      content: "content",
    });
    expect(notificationsRepository.create).toHaveBeenNthCalledWith(
      1,
      notification,
    );
  });
});
