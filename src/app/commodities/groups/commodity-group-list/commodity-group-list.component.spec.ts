import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityGroupListComponent } from './commodity-group-list.component';

describe('CommodityGroupListComponent', () => {
  let component: CommodityGroupListComponent;
  let fixture: ComponentFixture<CommodityGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityGroupListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
