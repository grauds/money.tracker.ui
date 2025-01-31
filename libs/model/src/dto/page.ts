export class Page<T> {
  'content': T[];
  'pageable': {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  'last': boolean;
  'totalPages': number;
  'totalElements': number;
  'size': number;
  'first': boolean;
  'sort': {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  'number': number;
  'numberOfElements': number;
  'empty': boolean;
}
