import {HateoasResource, Resource} from '@lagoshny/ngx-hateoas-client';

@HateoasResource('moneyTypes')
export class MoneyType extends Resource {

  name!: string;

  code!: string;

  sign!: string;

}
