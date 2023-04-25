import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityGroupCommoditiesComponent } from './commodity-group-commodities.component';

describe('CommodityGroupCommoditiesComponent', () => {
  let component: CommodityGroupCommoditiesComponent;
  let fixture: ComponentFixture<CommodityGroupCommoditiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityGroupCommoditiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommodityGroupCommoditiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
