import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  shareReplay,
  take,
  tap
} from 'rxjs';
import { MoneyType, MoneyTypes } from '@clematis-shared/model';
import {
  HateoasResourceService,
  PagedResourceCollection,
  PagedGetOption
} from '@lagoshny/ngx-hateoas-client';

import { SearchService } from './search.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class MoneyTypeService extends SearchService<MoneyType> {
  private defaultCurrencyName = 'RUB';

  private moneyTypesSubject = new BehaviorSubject<MoneyType[]>([]);

  public moneyTypes$: Observable<MoneyType[]> =
    this.moneyTypesSubject.asObservable();

  private selectedMoneyTypeSubject = new BehaviorSubject<MoneyType | null>(
    null,
  );

  public selectedMoneyType$: Observable<MoneyType | undefined> =
    this.selectedMoneyTypeSubject.asObservable().pipe(
      map((selected) => {
        if (selected) {
          return selected;
        }
        // Fallback
        return this.moneyTypesSubject
          .getValue()
          .find((type) => type.code === this.defaultCurrencyName);
      }),
      distinctUntilChanged(),
    );

  constructor(
    private hateoasService: HateoasResourceService,
    override environmentService: EnvironmentService,
  ) {
    super(environmentService);
    this.preloadMoneyTypes().subscribe();
  }

  public preloadMoneyTypes(): Observable<MoneyType[]> {
    const options: PagedGetOption = { pageParams: { size: 100 } };
    return this.hateoasService.getPage<MoneyType>(MoneyType, options).pipe(
      map((collection) => collection.resources),
      tap((types: MoneyType[]) => {

        // Dynamic Enum population
        if (MoneyTypes && typeof MoneyTypes === 'object') {
          // Cast once to a standard mutable record structure
          const dynamicEnum = MoneyTypes as Record<string, string>;
          // Clear old keys safely
          Object.keys(dynamicEnum).forEach((key) => delete dynamicEnum[key]);
          // Dynamically populate fields
          types.forEach((type) => {
            if (type.code) {
              dynamicEnum[type.code] = type.code;
            }
          });
        }

        // Hydrate the list cache
        this.moneyTypesSubject.next(types);

        // Explicitly assign default if nothing is selected yet
        const currentSelection = this.selectedMoneyTypeSubject.getValue();
        if (!currentSelection) {
          const defaultCurrency = types.find(
            (type) => type.code === this.defaultCurrencyName,
          );
          if (defaultCurrency) {
            this.selectedMoneyTypeSubject.next(defaultCurrency);
          } else {
            console.warn(
              `Default currency '${this.defaultCurrencyName}'
              not found in backend response.`,
            );
          }
        } else {
          // If a user somehow selected something before preload finished,
          // refresh the stream
          this.selectedMoneyTypeSubject.next(currentSelection);
        }
      }),
      shareReplay(1),
    );
  }

  public selectMoneyType(moneyType: MoneyType): void {
    this.selectedMoneyTypeSubject.next(moneyType);
  }

  // Action method to select by string code (e.g., selectMoneyTypeByCode('USD'))
  public selectMoneyTypeByCode(code: string): void {
    const target = this.moneyTypesSubject
      .getValue()
      .find((type) => type.code === code);
    if (target) {
      this.selectedMoneyTypeSubject.next(target);
    } else {
      console.warn(
        `MoneyType with code ${code} was not found in preloaded data.`,
      );
    }
  }

  // Synchronous getter for immediate snapshot access
  public getSelectedMoneyType(): MoneyType {
    return (
      this.selectedMoneyTypeSubject.getValue() ||
      this.moneyTypesSubject
        .getValue()
        .find((type) => type.code === this.defaultCurrencyName) ||
      Object.assign(new MoneyType(), { code: this.defaultCurrencyName })
    );
  }

  public getLoadedMoneyTypes(): MoneyType[] {
    return this.moneyTypesSubject.getValue();
  }

  searchPage(
    options: PagedGetOption | undefined,
    queryName: string,
  ): Observable<PagedResourceCollection<MoneyType>> {
    return this.hateoasService.searchPage<MoneyType>(
      MoneyType,
      queryName,
      options,
    );
  }

  getPage(
    options: PagedGetOption | undefined,
  ): Observable<PagedResourceCollection<MoneyType>> {
    return this.hateoasService.getPage<MoneyType>(MoneyType, options);
  }

  public getCurrencyByCode(code: string): Observable<MoneyType> {
    return this.moneyTypes$.pipe(
      filter((types) => types && types.length > 0),
      take(1),
      map((types) => {
        const found = types.find((t) => t.code === code);
        if (!found) {
          return (
            types.find((t) => t.code === this.defaultCurrencyName) ||
            Object.assign(new MoneyType(), { code: code })
          );
        }
        return found;
      }),
    );
  }

  public getCachedCurrencyByCode(code: string): MoneyType | undefined {
    return this.getLoadedMoneyTypes().find((type) => type.code === code);
  }
}
