import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentCommoditiesComponent } from './agent-commodities.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, RouterModule } from "@angular/router";
import {
  MoneyTypeService,
  ExpenseItemsService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';
import { of } from 'rxjs';

import { MatCheckboxModule } from "@angular/material/checkbox";
import { NgxEchartsModule } from "ngx-echarts";
import { mockResizeObserver } from "../../../mocks/mock_resize_observer";
import { HeaderComponent } from "../../header/header.component";

describe('AgentCommoditiesComponent', () => {
  let component: AgentCommoditiesComponent;
  let fixture: ComponentFixture<AgentCommoditiesComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ id: 9 }),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [AgentCommoditiesComponent],
      imports: [
        SharedComponentsModule,
        MatCheckboxModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        }),
        RouterModule.forRoot([{ path: '', component: HeaderComponent }]),
      ],
      providers: [
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        ExpenseItemsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCommoditiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
