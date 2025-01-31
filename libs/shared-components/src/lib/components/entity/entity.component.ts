import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Entity } from '@clematis-shared/model';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

/**
 * Basic component for a REST resource which parsers URLs like /entities/[id]
 * and loads the resource on initialisation.
 */
export abstract class EntityComponent<T extends Entity> {
  entity: T | undefined;

  id = '';

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  protected constructor(
    private type: new () => T,
    protected resourceService: HateoasResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) {
    this.pageSubscription = this.router.events.subscribe((val) => {
      // see also
      if (val instanceof NavigationEnd) {
        this.onInit();
      }
    });
  }

  onInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== this.id) {
      this.id = id ?? '';
      this.loadData();
    }
  }

  loadData = () => {
    if (this.id) {
      this.resourceService
        .getResource<T>(this.type, this.id)
        .subscribe((entity: T) => {
          this.setEntity(entity);
        });
    }
  };

  setEntity(entity: T) {
    this.entity = entity;
    this.title.setTitle(
      this.entity.name ? this.entity.name : this.entity.getSelfLinkHref()
    );
  }
}
