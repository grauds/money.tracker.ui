import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { ExpensesListComponent } from './expenses-list.component';
import { fakeActivatedRoute } from '../../../test-setup';

describe('ExpensesListComponent', () => {
  let component: ExpensesListComponent;
  let fixture: ComponentFixture<ExpensesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpensesListComponent],
      imports: [SharedComponentsModule],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.entityList = {
      setFilter: jest.fn(),
      removeFilter: jest.fn(),
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear date controls when the filter map is emptied', () => {
    component.range.controls.startDate.setValue(
      new Date('2026-07-21T00:00:00Z'),
    );
    component.range.controls.endDate.setValue(new Date('2026-07-22T00:00:00Z'));

    component.updateFilter(new Map());

    expect(component.range.controls.startDate.value).toBeNull();
    expect(component.range.controls.endDate.value).toBeNull();
  });

  it('should hydrate date controls from a filter map', () => {
    component.updateFilter(
      new Map([
        ['startDate', '2026-07-01'],
        ['endDate', '2026-07-08'],
      ]),
    );

    expect(component.getStartDate()).toBe('2026-07-01');
    expect(component.getEndDate()).toBe('2026-07-08');
  });

  it('should hydrate date controls from URL params on init', () => {
    (fakeActivatedRoute.snapshot as any).queryParams = {
      startDate: '2026-07-01',
      endDate: '2026-07-08',
    };

    const initFixture = TestBed.createComponent(ExpensesListComponent);
    const initComponent = initFixture.componentInstance;
    initFixture.detectChanges();

    expect(initComponent.getStartDate()).toBe('2026-07-01');
    expect(initComponent.getEndDate()).toBe('2026-07-08');
  });

  it('should push start date changes into the entity list filter', () => {
    component.setStartDate({
      value: new Date('2026-07-21T00:00:00Z'),
    } as MatDatepickerInputEvent<Date>);

    expect(component.entityList.setFilter).toHaveBeenCalledWith(
      'startDate',
      '2026-07-21',
    );
  });
});
