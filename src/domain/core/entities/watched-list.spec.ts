import { WatchedList } from "./watched-list";

class DateWatchedList extends WatchedList<Date> {
  compareItems(a: Date, b: Date): boolean {
    return a.getTime() === b.getTime();
  }
}

describe("WatchedList [Core Entity]", () => {
  let list: DateWatchedList;

  beforeEach(() => {
    list = new DateWatchedList([
      new Date(2010),
      new Date(2011),
      new Date(2012),
    ]);
  });

  test("create a new WatchedList", () => {
    expect(list.getItems()).toHaveLength(3);
  });

  test("adding new items to the list", () => {
    list.add(new Date(2013));

    expect(list.getItems()).toHaveLength(4);
    expect(list.getNewItems()).toEqual([new Date(2013)]);
  });

  test("removing items from the list", () => {
    list.remove(new Date(2011));

    expect(list.getItems()).toHaveLength(2);
    expect(list.getRemovedItems()).toEqual([new Date(2011)]);
  });

  test("adding and removing items from the list", () => {
    list.add(new Date(2013));
    list.remove(new Date(2011));

    expect(list.getItems()).toHaveLength(3);
    expect(list.getRemovedItems()).toEqual([new Date(2011)]);
    expect(list.getNewItems()).toEqual([new Date(2013)]);
  });

  test("removing and adding the same item", () => {
    list.remove(new Date(2011));
    list.add(new Date(2011));

    expect(list.getItems()).toHaveLength(3);
    expect(list.getRemovedItems()).toEqual([]);
    expect(list.getNewItems()).toEqual([]);
  });

  test("adding and removing the same item", () => {
    list.add(new Date(2013));
    list.remove(new Date(2013));

    expect(list.getItems()).toHaveLength(3);
    expect(list.getRemovedItems()).toEqual([]);
    expect(list.getNewItems()).toEqual([]);
  });

  test("updating the list", () => {
    list.update([new Date(2011), new Date(2014), new Date(2020)]);

    expect(list.getItems()).toHaveLength(3);
    expect(list.getRemovedItems()).toEqual([new Date(2010), new Date(2012)]);
    expect(list.getNewItems()).toEqual([new Date(2014), new Date(2020)]);
  });
});
