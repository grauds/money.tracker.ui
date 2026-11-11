import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';

import { DashboardStatsCardComponent } from './dashboard-stats-card.component';

describe('DashboardStatsCardComponent', () => {
  let component: DashboardStatsCardComponent;
  let fixture: ComponentFixture<DashboardStatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardStatsCardComponent],
      providers: [CurrencyPipe],
    }).compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.title = 'INCOME';
    fixture.detectChanges();
    const titleEl: HTMLElement = fixture.nativeElement.querySelector('.stats-card-title');
    expect(titleEl.textContent.trim()).toBe('INCOME');
  });

  it('should display value with currency formatting', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.value = 1234.56;
    component.currencyCode = 'RUB';
    fixture.detectChanges();
    const valueEl: HTMLElement = fixture.nativeElement.querySelector('.stats-card-value');
    expect(valueEl.textContent).toContain('1,234.56');
  });

  it('should display subtitle', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.subtitle = '10 txns';
    fixture.detectChanges();
    const subtitleEl: HTMLElement = fixture.nativeElement.querySelector('.stats-card-subtitle');
    expect(subtitleEl.textContent.trim()).toBe('10 txns');
  });

  it('should apply positive class when positive is true', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.positive = true;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.stats-card');
    expect(el.className).toContain('positive');
    expect(el.className).not.toContain('neutral');
  });

  it('should apply negative class when negative is true', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.negative = true;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.stats-card');
    expect(el.className).toContain('negative');
    expect(el.className).not.toContain('neutral');
  });

  it('should apply neutral class when neither positive nor negative', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.stats-card');
    expect(el.className).toContain('neutral');
  });

  it('should apply highlight class when highlight is true', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.highlight = true;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.stats-card');
    expect(el.className).toContain('highlight');
    expect(el.className).not.toContain('neutral');
  });

  it('should apply custom color via CSS variable', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.color = '#ff0000';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.stats-card');
    expect(el.style.getPropertyValue('--card-color')).toBe('#ff0000');
  });

  it('should apply custom background via CSS variable', () => {
    fixture = TestBed.createComponent(DashboardStatsCardComponent);
    component = fixture.componentInstance;
    component.bg = 'blueviolet';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.stats-card');
    expect(el.style.getPropertyValue('--card-bg')).toBe('blueviolet');
  });
});
