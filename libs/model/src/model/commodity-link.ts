import { HateoasProjection } from "@lagoshny/ngx-hateoas-client";
import { Commodity, Entity } from "@clematis-shared/model";

@HateoasProjection(Commodity, 'commodityLink')
export class CommodityLink extends Entity {
}
