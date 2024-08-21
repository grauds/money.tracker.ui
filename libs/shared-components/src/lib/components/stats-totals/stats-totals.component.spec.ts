import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsTotalsComponent } from './stats-totals.component';
import { MatGridListModule } from '@angular/material/grid-list';

describe('StatsTotalsComponentComponent', () => {
  let component: StatsTotalsComponent;
  let fixture: ComponentFixture<StatsTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsTotalsComponent],
      imports: [
        MatGridListModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
