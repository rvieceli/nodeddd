export class PaginationPolicy {
  static MAX_PAGE_SIZE = 50;
  static DEFAULT_PAGE_SIZE = 10;

  static isAllowed(page: number, pageSize: number): boolean {
    if (page < 1) return false;
    if (pageSize < 1) return false;
    if (pageSize > PaginationPolicy.MAX_PAGE_SIZE) return false;
    return true;
  }

  static getAllowablePageSize(pageSize: number): number {
    return Math.min(Math.max(pageSize, 1), PaginationPolicy.MAX_PAGE_SIZE);
  }

  static getAllowablePage(page: number): number {
    return Math.max(page, 1);
  }
}
