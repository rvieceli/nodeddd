import { InMemoryNotificationsRepository } from "@test/repositories/in-memory.notifications.repository";
import { NotificationsRepository } from "../../repositories/notifications.repository";
import { ReadNotificationUseCase } from "./read-notification";
import { makeNotification } from "@test/factories/make-notification";
import { UniqueId } from "@domain/core/entities/unique-id";
import {
  NotificationNotFound,
  ReadNotificationNotAllowed,
} from "../../errors/notification.errors";

describe("Read notification [Use Case]", () => {
  let notificationsRepository: NotificationsRepository;
  let sut: ReadNotificationUseCase;

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository();
    sut = new ReadNotificationUseCase(notificationsRepository);

    vi.spyOn(notificationsRepository, "findById");
    vi.spyOn(notificationsRepository, "save");
  });

  it("should mark notification as read", async () => {
    // prepare
    const recipientId = UniqueId.create();
    const original = makeNotification({
      recipientId,
    });

    await notificationsRepository.create(original);

    const notificationId = original.getId();
    const actorId = recipientId.getId();

    // act
    const result = await sut.execute({
      actorId,
      notificationId,
    });

    // assert
    expect(result.isOk()).toBe(true);
    expect(notificationsRepository.findById).toHaveBeenNthCalledWith(
      1,
      notificationId,
    );
    expect(notificationsRepository.save).toHaveBeenCalledOnce();
    expect(notificationsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: original.id,
        readAt: expect.any(Date),
      }),
    );

    const notification = await notificationsRepository.findById(notificationId);

    expect(notification).not.toEqual(original);
    expect(notification).toMatchObject({
      id: original.id,
      readAt: expect.any(Date),
    });
  });

  describe("when notification cannot be mark as read", () => {
    it("should throw an error if actor is not the author", async () => {
      // prepare
      const recipientId = UniqueId.create();

      const answer = makeNotification({
        content: "Old content",
        recipientId,
      });

      await notificationsRepository.create(answer);

      const notificationId = answer.getId();
      const actorId = UniqueId.getId();

      // act
      const result = await sut.execute({
        actorId,
        notificationId,
      });

      // assert
      expect(recipientId.getId()).not.toBe(actorId);
      expect(result.value).toBeInstanceOf(ReadNotificationNotAllowed);
      expect(notificationsRepository.save).not.toHaveBeenCalled();
    });

    it("should return an error if answer does not exist", async () => {
      // prepare
      const actorId = UniqueId.getId();
      const notificationId = UniqueId.getId();

      // act
      const result = await sut.execute({
        actorId,
        notificationId,
      });

      // assert
      expect(result.value).toBeInstanceOf(NotificationNotFound);
      expect(notificationsRepository.save).not.toHaveBeenCalled();
    });
  });
});
