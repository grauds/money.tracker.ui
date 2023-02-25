import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastCommoditiesListComponent } from './last-commodities-list.component';

describe('LastCommoditiesListComponent', () => {
  let component: LastCommoditiesListComponent;
  let fixture: ComponentFixture<LastCommoditiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LastCommoditiesListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LastCommoditiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
