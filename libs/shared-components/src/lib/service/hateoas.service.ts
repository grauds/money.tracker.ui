import { HateoasResourceService, PagedResourceCollection, Resource } from "@lagoshny/ngx-hateoas-client";
import { PagedGetOption } from "@lagoshny/ngx-hateoas-client/lib/model/declarations";
import { Observable } from "rxjs";
import { Injectable } from '@angular/core';
import { SearchService } from "./search.service";

export class HateoasService<T extends Resource> extends SearchService<T> {

  constructor(private type: new () => T, private hateoasService: HateoasResourceService) {
    super();
  }

  searchPage(options?: PagedGetOption,
             queryName?: string): Observable<PagedResourceCollection<T>> {
    if (queryName) {
      return this.hateoasService.searchPage(this.type, queryName, options)
    } else {
      return this.hateoasService.getPage(this.type, options)
    }
  }
}
