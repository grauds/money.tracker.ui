import { Injectable } from "@angular/core";
import { SearchService } from "./search.service";
import { Entity, InOutDelta, MoneyType } from "@clematis-shared/model";
import { HateoasResourceService, PagedResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { EnvironmentService } from "./environment.service";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable, of, switchMap } from "rxjs";


@Injectable()
export class InOutService extends SearchService<InOutDelta> {

  constructor(private hateoasService: HateoasResourceService,
              override environmentService: EnvironmentService) {
    super(environmentService);
  }

  getInOutDeltasInCurrency(moneyType: MoneyType) {
    return this.hateoasService.searchCollection<InOutDelta>(InOutDelta, "code",
      {
        params: {
          code: moneyType.code
        }
      });
  }

  getPage(options: PagedGetOption | undefined):
    Observable<PagedResourceCollection<InOutDelta>> {
    return this.hateoasService.getPage<InOutDelta>(InOutDelta, options).pipe(
      this.postprocess()
    );
  }

  searchPage(options: PagedGetOption | undefined, queryName: string):
    Observable<PagedResourceCollection<InOutDelta>> {
    return this.hateoasService.searchPage<InOutDelta>(InOutDelta, queryName, options).pipe(
      this.postprocess()
    );
  }

  postprocess() {
    return switchMap((arr: PagedResourceCollection<InOutDelta>) => {
      arr.resources = arr.resources.map((inOutDelta: InOutDelta) => {
        inOutDelta.commodityLink = Entity.getRelativeSelfLinkHref(inOutDelta.commodity)
        inOutDelta.moneyTypeLink = Entity.getRelativeSelfLinkHref(inOutDelta.moneyType)
        return inOutDelta
      })
      return of(arr)
    });
  }
}
