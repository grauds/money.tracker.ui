import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommoditiesGroupsComponent } from './commodities-groups.component';

describe('CommoditiesGroupsComponent', () => {
  let component: CommoditiesGroupsComponent;
  let fixture: ComponentFixture<CommoditiesGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommoditiesGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommoditiesGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
