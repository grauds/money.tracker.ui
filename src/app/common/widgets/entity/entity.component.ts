import { ActivatedRoute } from '@angular/router';
import { Entity } from '../../model/entity';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';

export abstract class EntityComponent<T extends Entity> {

  entity: T | undefined;

  id: string | number | null | undefined

  protected constructor(private type: new () => T,
                        private resourceService: HateoasResourceService,
                        private route: ActivatedRoute) { }

  onInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')
    this.loadData()
  }

  loadData = () => {
    if (this.id) {
      this.resourceService.getResource<T>(this.type, this.id).subscribe((entity: T) => {
        this.entity = entity
      })
    }

  }

}
