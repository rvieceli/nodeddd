import { makeMany } from "@test/factories/make-many";
import { makeNotification } from "@test/factories/make-notification";

import { InMemoryNotificationsRepository } from "@test/repositories/in-memory.notifications.repository";

import { NotificationsRepository } from "../../repositories/notifications.repository";

import { FetchNotificationsUseCase } from "./fetch-notifications";
import { UniqueId } from "@domain/core/entities/unique-id";

describe("Fetch Recent Notifications [Use Case]", () => {
  let notificationsRepository: NotificationsRepository;
  let sut: FetchNotificationsUseCase;

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository();

    sut = new FetchNotificationsUseCase(notificationsRepository);

    vi.spyOn(notificationsRepository, "findManyByRecipientId");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be able the fetch recent notifications", async () => {
    const recipientId = UniqueId.create();

    // prepare
    notificationsRepository.create(
      makeNotification({
        recipientId,
        createdAt: new Date(2024, 0, 14, 10, 0, 0),
      }),
    );
    notificationsRepository.create(
      makeNotification({
        recipientId,
        createdAt: new Date(2024, 0, 16, 10, 0, 0),
      }),
    );
    notificationsRepository.create(
      makeNotification({
        recipientId,
        createdAt: new Date(2024, 0, 15, 10, 0, 0),
      }),
    );

    // act
    const result = await sut.execute({
      recipientId: recipientId.getId(),
      page: 1,
      pageSize: 10,
    });

    const page = result.unwrap();

    // assert
    expect(page.items).toEqual([
      expect.objectContaining({ createdAt: new Date(2024, 0, 16, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 15, 10, 0, 0) }),
      expect.objectContaining({ createdAt: new Date(2024, 0, 14, 10, 0, 0) }),
    ]);

    expect(notificationsRepository.findManyByRecipientId).toHaveBeenCalledTimes(
      1,
    );
  });

  it("should be able the fetch recent notifications with pagination", async () => {
    // prepare
    const recipientId = UniqueId.create();

    await makeMany(
      () =>
        notificationsRepository.create(
          makeNotification({
            recipientId,
            createdAt: new Date(2024, 0, 14, 10, 0, 0),
          }),
        ),
      29,
    );

    // act
    const result1 = await sut.execute({
      recipientId: recipientId.getId(),
      page: 1,
      pageSize: 10,
    });

    const page1 = result1.unwrap();

    // assert
    expect(page1).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 29,
      totalPages: 3,
      items: expect.any(Array),
    });

    expect(page1.items).toHaveLength(10);

    expect(
      notificationsRepository.findManyByRecipientId,
    ).toHaveBeenNthCalledWith(1, recipientId.getId(), {
      page: 1,
      pageSize: 10,
    });

    // act
    const result2 = await sut.execute({
      recipientId: recipientId.getId(),
      page: 2,
      pageSize: 15,
    });

    const page2 = result2.unwrap();

    // assert
    expect(page2).toMatchObject({
      page: 2,
      pageSize: 15,
      total: 29,
      totalPages: 2,
      items: expect.any(Array),
    });

    expect(page2.items).toHaveLength(14);

    expect(
      notificationsRepository.findManyByRecipientId,
    ).toHaveBeenNthCalledWith(2, recipientId.getId(), {
      page: 2,
      pageSize: 15,
    });
  });
});
