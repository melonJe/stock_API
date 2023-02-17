import { IPageInfo } from '@common/interfaces';

export class PageInfoDto implements IPageInfo {
  total: number | Promise<number>;
  limit: number;
  page: number;
}

export class PaginatedResponseDto<T> implements PaginatedResponseDto<T> {
  pageInfo: PageInfoDto;
  items: T[] | Promise<T[]>;
}
