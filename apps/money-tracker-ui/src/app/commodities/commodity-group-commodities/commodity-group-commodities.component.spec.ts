import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from 'rxjs';

import { CommodityGroupCommoditiesComponent } from './commodity-group-commodities.component';
import { SharedComponentsModule } from '@clematis-shared/shared-components';


describe('CommodityGroupCommoditiesComponent', () => {
  let component: CommodityGroupCommoditiesComponent;
  let fixture: ComponentFixture<CommodityGroupCommoditiesComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ })      
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityGroupCommoditiesComponent ],
      imports: [
        SharedComponentsModule
      ],
      providers: [
        HttpClient,
        HttpHandler,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
       ]
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

