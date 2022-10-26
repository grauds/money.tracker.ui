import {HateoasResource, Resource} from "@lagoshny/ngx-hateoas-client";


@HateoasResource('monthlyDeltas')
export class MonthlyDelta extends Resource {

  code: string = '';

  year: number = 0;

  month: number = 0;

  delta: number = 0;
}
