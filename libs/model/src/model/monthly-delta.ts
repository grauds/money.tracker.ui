import {HateoasResource, Resource} from "@lagoshny/ngx-hateoas-client";


@HateoasResource('monthlyDeltas')
export class MonthlyDelta extends Resource {

  code = '';

  year = 0;

  month = 0;

  delta = 0;
}
