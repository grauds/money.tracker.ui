import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardChartContainerComponent } from './dashboard-chart-container.component';

describe('DashboardChartContainerComponent', () => {
  let component: DashboardChartContainerComponent;
  let fixture: ComponentFixture<DashboardChartContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardChartContainerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(DashboardChartContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture = TestBed.createComponent(DashboardChartContainerComponent);
    component = fixture.componentInstance;
    component.title = 'MONTHLY TREND';
    fixture.detectChanges();
    const titleEl: HTMLElement = fixture.nativeElement.querySelector('.chart-panel-title');
    expect(titleEl.textContent).toContain('MONTHLY TREND');
  });

  it('should have loading set to false by default', () => {
    fixture = TestBed.createComponent(DashboardChartContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.loading).toBe(false);
  });

  it('should accept loading input', () => {
    fixture = TestBed.createComponent(DashboardChartContainerComponent);
    component = fixture.componentInstance;
    component.loading = true;
    fixture.detectChanges();
    expect(component.loading).toBe(true);
  });
});
