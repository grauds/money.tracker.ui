import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeEventElementComponent } from './exchange-event-element.component';

describe('ExchangeEventElementComponent', () => {
  let component: ExchangeEventElementComponent;
  let fixture: ComponentFixture<ExchangeEventElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExchangeEventElementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeEventElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
