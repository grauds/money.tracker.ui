import { ActivatedRoute } from '@angular/router';
import { Entity } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Title } from '@angular/platform-browser';

export abstract class EntityComponent<T extends Entity> {

  entity: T | undefined;

  id: string | null = null

  protected constructor(private type: new () => T,
                        protected resourceService: HateoasResourceService,
                        private route: ActivatedRoute,
                        private title: Title) { }

  onInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')
    this.loadData()
  }

  loadData = () => {
    if (this.id) {
      this.resourceService.getResource<T>(this.type, this.id).subscribe((entity: T) => {
        this.setEntity(entity)
      })
    }

  }

  setEntity(entity: T) {
    this.entity = entity
    this.title.setTitle(this.entity.name ? this.entity.name : this.entity.getSelfLinkHref())
  }

}
