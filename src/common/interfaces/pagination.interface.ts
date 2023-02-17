export interface IPageInfo {
  total: number | Promise<number>;
  limit: number;
  page: number;
}

export interface IPaginatedResponse<T> {
  pageInfo: IPageInfo;
  items: T[] | Promise<T[]>;
}
