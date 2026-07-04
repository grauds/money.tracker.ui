import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayComponent } from './day.component';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import { of } from 'rxjs';
import { WeatherDashboardPanelComponent } from './weather-dashboard-panel/weather-dashboard-panel.component';
import {
  CurrencySpacePipe,
  DateBreadcrumbsComponent,
  MoneyTypeService,
  WeatherService
} from '@clematis-shared/shared-components';
import { MatIconModule } from '@angular/material/icon';
import { mockMoneyTypeService } from '../../../test-setup';

describe('DayComponent', () => {
  let component: DayComponent;
  let fixture: ComponentFixture<DayComponent>;
  let mockWeatherService: any;

  beforeEach(async () => {
    // 1. Create a Jest mock service object
    mockWeatherService = {
      getDay: jest
        .fn()
        .mockReturnValue(of({ presentWeather: 'Clear Sky', temperature: 22 })),
    };

    // 2. Build a full Jest mock for ActivatedRoute tracking variables
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
        DayComponent,
        WeatherDashboardPanelComponent,
        DateBreadcrumbsComponent,
      ],
      imports: [RouterLinkWithHref, MatIconModule, CurrencySpacePipe],
      providers: [
        CurrencyPipe,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WeatherService, useValue: mockWeatherService },
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
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
