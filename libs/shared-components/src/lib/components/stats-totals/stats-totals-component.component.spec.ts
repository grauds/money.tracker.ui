import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsTotalsComponentComponent } from './stats-totals-component.component';

describe('StatsTotalsComponentComponent', () => {
  let component: StatsTotalsComponentComponent;
  let fixture: ComponentFixture<StatsTotalsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsTotalsComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsTotalsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
