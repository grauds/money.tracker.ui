import { HateoasResource } from "@lagoshny/ngx-hateoas-client";
import { Entity } from "./entity";

@HateoasResource('incomeMonthly')
export class IncomeMonthly extends Entity {

  code = '';

  year = 0;

  month = 0;

  total = 0;

  totalConverted = 0
}
