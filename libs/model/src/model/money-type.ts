import {HateoasResource, Resource} from '@lagoshny/ngx-hateoas-client';

@HateoasResource('moneyTypes')
export class MoneyType extends Resource {

  code: string | undefined;

}
