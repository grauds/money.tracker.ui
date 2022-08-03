import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommoditiesListComponent } from './commodities-list.component';

describe('CommoditiesListComponent', () => {
  let component: CommoditiesListComponent;
  let fixture: ComponentFixture<CommoditiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommoditiesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommoditiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
