import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityGroupComponent } from './commodity-group.component';

describe('CommodityGroupComponent', () => {
  let component: CommodityGroupComponent;
  let fixture: ComponentFixture<CommodityGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
