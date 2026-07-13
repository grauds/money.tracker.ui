import { Inject, Injectable, Type } from "@angular/core";
import { Entity, MoneyType } from '@clematis-shared/model';
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import {
  HateoasResourceService,
  PagedGetOption, PagedResourceCollection, ResourceCollection
} from "@lagoshny/ngx-hateoas-client";

import { EnvironmentService } from "./environment.service";
import { SearchService } from "./search.service";
import {
  PARENT_RESOURCE_TYPE,
  RESOURCE_TYPE
} from "./entity-resource-type.token";

@Injectable()
export class EntityService<
  T extends Entity,
  P extends Entity,
> extends SearchService<T> {
  constructor(
    private http: HttpClient,
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService,
    // Inject the runtime token safely here
    @Inject(RESOURCE_TYPE) private resourceType: Type<T>,
    @Inject(PARENT_RESOURCE_TYPE) private parentResourceType: Type<P>,
  ) {
    super(environmentService);
  }

  override searchPage(
    options: PagedGetOption,
    queryName: string,
  ): Observable<PagedResourceCollection<T>> {
    return this.hateoasService.searchPage<T>(
      this.resourceType,
      queryName,
      options,
    );
  }

  override getPage(
    options: PagedGetOption | undefined,
  ): Observable<PagedResourceCollection<T>> {
    return this.hateoasService.getPage<T>(this.resourceType, options);
  }

  getPath(id: string | null): Observable<ResourceCollection<P>> {
    if (id) {
      return this.hateoasService.searchCollection<P>(
        this.parentResourceType,
        'pathById',
        { params: { id } },
      );
    }
    return of(new ResourceCollection<P>());
  }

  getIncomeSum(id: string, moneyCode: MoneyType): Observable<number> {
    if (id) {
      const className =
        (this.resourceType as any).resourceName || this.resourceType.name;

      return this.http.get<number>(
        this.getUrl(`/incomeItems/search/sum${className}Income`),
        {
          params: {
            id: id,
            moneyCode: moneyCode.code,
          },
        },
      );
    }
    return of(0);
  }

  getExpensesSum(id: string, moneyCode: MoneyType): Observable<number> {
    if (id) {
      const className =
        (this.resourceType as any).resourceName || this.resourceType.name;

      return this.http.get<number>(
        this.getUrl(`/expenseItems/search/sum${className}Expenses`),
        {
          params: {
            id: id,
            moneyCode: moneyCode.code,
          },
        },
      );
    }
    return of(0);
  }
}
