import {Entity} from "./entity";
import {EntityCollection} from "./entity-collection";

export class EntityGroup extends Entity {

  children: EntityCollection = new EntityCollection();

}
