import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayComponent } from './day.component';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import { of } from 'rxjs';
import { WeatherDashboardPanelComponent } from './weather-dashboard-panel/weather-dashboard-panel.component';
import {
  CurrencySpacePipe,
  DateBreadcrumbsComponent,
  EntityBalanceInfoComponent,
  EntityListComponent,
  ExpenseItemsService,
  IncomeItemsService,
  MoneyTypeService,
  WeatherService,
  WordpressService
} from '@clematis-shared/shared-components';
import { MatIconModule } from '@angular/material/icon';
import { mockMoneyTypeService } from '../../../test-setup';

describe('DayComponent', () => {
  let component: DayComponent;
  let fixture: ComponentFixture<DayComponent>;
  let mockWeatherService: any;
  let mockWordpressService: any;

  beforeEach(async () => {
    // Weather mock service
    mockWeatherService = {
      getDay: jest
        .fn()
        .mockReturnValue(of({ presentWeather: 'Clear Sky', temperature: 22 })),
    };

    // WordPress mock service
    mockWordpressService = {
      getArticlesByDay: jest.fn().mockReturnValue(of([])),
    };

    // Mock for activated route
    const mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => (key === 'date' ? '2026-06-23' : null),
      }),
      params: of({
        date: '2026-06-23',
      }),
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'date' ? '2026-06-23' : null),
        },
        params: {
          date: '2026-06-23',
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [
        EntityListComponent,
        EntityBalanceInfoComponent,
        DayComponent,
        WeatherDashboardPanelComponent,
        DateBreadcrumbsComponent,
      ],
      imports: [RouterLinkWithHref, MatIconModule, CurrencySpacePipe],
      providers: [
        CurrencyPipe,
        IncomeItemsService,
        ExpenseItemsService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WeatherService, useValue: mockWeatherService },
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
        { provide: WordpressService, useValue: mockWordpressService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DayComponent);
    component = fixture.componentInstance;

    // Explicitly run change detection loops to fire ngOnInit lifecycle stubs
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
