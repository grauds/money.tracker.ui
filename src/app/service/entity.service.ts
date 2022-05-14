import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Entity} from "../model/entity";
import {environment} from "../../environments/environment";

class EntitiesPage {

  private readonly _entities: Entity[];
  private readonly _total: number;

  get total(): number {
    return this._total;
  }

  get entities(): Entity[] {
    return this._entities;
  }

  constructor(entities: Entity[], total: number) {
    this._entities = entities;
    this._total = total;
  }

}

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private readonly _endpoint: string;

  constructor(private http: HttpClient, endpoint: string) {
    this._endpoint = endpoint;
  }

  _get(offset: number,
       limit: number,
       callback: ((arg0: EntitiesPage) => void),
       error: ((arg0: Error) => void)) {

    const observer = {
      next: (response: any) => {
        callback(this.processResults(response))
      }, error: (e: Error) => {
        error(e)
      }
    }

    return this.http.get<EntitiesPage>(environment.apiUrl + this._endpoint, {
      params: {
        sort: 'name,asc',
        page: offset,
        size: limit
      }
    }).subscribe(observer)
  }

  processResults = (response: any) => {

    let entities: any[];
    entities = [];
    const total = response.total;
    if (response.content instanceof Array) {

      response.content.forEach((alert: {
        id: number;
        name: string;
      }) => {

        entities.push({
          'id': alert.id,
          'name': alert.name
        });
      });
    }

    return new EntitiesPage(entities, total);
  };
}
