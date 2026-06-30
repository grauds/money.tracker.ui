import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherDashboardPanelComponent } from './weather-dashboard-panel.component';

describe('WeatherDashboardPanelComponent', () => {
  let component: WeatherDashboardPanelComponent;
  let fixture: ComponentFixture<WeatherDashboardPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeatherDashboardPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherDashboardPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
