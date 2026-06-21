import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Entity, MoneyTypes, Utils } from "@clematis-shared/model";
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { Title } from '@angular/platform-browser';
import {
  catchError,
  defaultIfEmpty,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
  throwError
} from "rxjs";
import { EntityService } from "../../service/entity.service";
import { Directive, OnDestroy, OnInit } from "@angular/core";

/**
 * Abstract component for managing entities of generic types T and P, where
 * T extends Entity and P extends Entity.
 * This component handles loading entity data, rendering paths,
 * and managing parent relationships.
 *
 * @template T The specific entity type this component manages.
 * @template P The parent entity type related to the managed entity.
 *
 * Features:
 * - Automatically subscribes to router navigation changes to reload data
 * when the route changes.
 * - Provides functionality to load entity data from a resource service.
 * - Handles parent entity relationships and constructs the path for
 * breadcrumb-like navigation.
 * - Displays expenses sum data related to an entity.
 * - Manages a loading state for asynchronous operations.
 *
 * Dependencies:
 * - `ActivatedRoute` for extracting data from the route.
 * - `HateoasResourceService` for requesting and manipulating entity data.
 * - `Router` for handling navigation events.
 * - `Title` for dynamically updating the document title.
 * - `EntityService` for additional operations on the parent entity
 * and calculating sums.
 */
@Directive()
export abstract class EntityComponent<T extends Entity, P extends Entity>
  implements OnInit, OnDestroy
{
  entity: T | undefined;

  id = '';

  parent: P | undefined;

  parentLink: string | undefined;

  path: Array<P> = [];

  incomeSum = 0;

  expensesSum = 0;

  loading = false;

  // subscribe for page updates in the address bar
  pageSubscription: Subscription;

  protected destroy$ = new Subject<void>();

  protected constructor(
    private type: new () => T,
    protected resourceService: HateoasResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    protected entityService: EntityService<T, P>,
  ) {
    this.pageSubscription = this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {

        if (val instanceof NavigationEnd) {
          this.onInit();
        }
      });
  }

  ngOnInit(): void {
    this.loading = true;
    this.onInit();
  }

  onInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== this.id) {
      this.id = id ?? '';
      this.loadData()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          next: () => {
            this.setLoading(false);
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          error: () => {
            this.setLoading(false);
          },
        });
    }
  }

  setLoading($event: boolean) {
    setTimeout(() => {
      this.loading = $event;
    });
  }

  loadData(): Observable<T> {
    if (!this.id) {
      return of();
    }

    return this.resourceService.getResource<T>(this.type, this.id).pipe(
      // Once the resource arrives, switch cleanly into stream execution
      switchMap((entity: T) => {
        return this.setEntity(entity).pipe(
          // Trigger the success hook on the base class template pattern
          tap(() => this.onEntityLoaded(entity)),
          // Map back to the entity object so downstream consumers
          // receive the entity instance
          switchMap(() => of(entity)),
        );
      }),
      // Catch-all error pipeline context
      catchError((err) => {
        this.onEntityLoadError(err);
        return throwError(() => err);
        // Forward the error downstream to implementing
        // taps/subscriptions
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onEntityLoaded(entity: T): void {
    // implement me
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onEntityLoadError(error: any): void {
    // implement me
  }

  setEntity(entity: T): Observable<void> {
    this.clearPreviousData();
    if (!entity) {
      return throwError(() => new Error('No entity provided to setEntity.'));
    }

    this.entity = entity;
    this.title.setTitle(entity.name ? entity.name : entity.getSelfLinkHref());

    // Ensure parent$ completes or emits a fallback if it's empty
    // (like on 404)
    const parent$ = this.entity?.getRelation<P>('parent').pipe(
      catchError((err) => {
        if (err?.status === 404) {
          this.parent = undefined;
          this.parentLink = undefined;
          // Return an observable that emits 'null' and then completes,
          // instead of EMPTY
          return of(null);
        }
        return throwError(() => err);
      }),
      // Guarantee it emits something even if the library implementation
      // acts purely as an empty stream
      defaultIfEmpty(null),
    );

    // Ensure expensesSum$ emits a fallback 0 and completes instead of
    // swallowing into EMPTY
    const expensesSum$ = this.entityService
      .getOperationsSum(this.id, MoneyTypes.RUB)
      .pipe(
        catchError((err) => {
          console.error('Failed to load expenses sum:', err);
          return of(0); // Return a default value instead of breaking the
          // forkJoin stream
        }),
        defaultIfEmpty(0),
      );

    // forkJoin will now guarantee execute because its dependencies are
    // guaranteed to emit and complete!
    return forkJoin({
      parent: parent$,
      expensesSum: expensesSum$,
    }).pipe(
      tap((result) => {
        // Explicitly check for a valid parent object
        // (ignoring our null fallback)
        if (result.parent) {
          this.parent = result.parent;
          this.parentLink = Entity.getRelativeSelfLinkHref(this.parent);
        }
        // Always assign the expense total value (even if it fell back to 0)
        this.expensesSum = result.expensesSum;
      }),
      switchMap((result) => {
        if (result.parent) {
          return this.entityService
            .getPath(Utils.getIdFromSelfUrl(result.parent))
            .pipe(
              tap((response) => {
                this.path = response.resources.reverse();
                if (result.parent) {
                  this.path.push(result.parent);
                }
              }),
              map(() => undefined),
            );
        }
        return of(undefined);
      }),
      catchError((err) => {
        console.error(
          'An error occurred loading base entity structural data',
          err,
        );
        return throwError(() => err);
      }),
    );
  }

  clearPreviousData() {
    this.parent = undefined;
    this.parentLink = undefined;
    this.path = [];
    this.incomeSum = 0;
    this.expensesSum = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
