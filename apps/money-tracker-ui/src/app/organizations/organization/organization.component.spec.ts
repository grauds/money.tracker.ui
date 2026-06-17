import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrganizationComponent } from './organization.component';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { ActivatedRoute, convertToParamMap } from '@angular/router';

import {
  ExpenseItemsService,
  OrganizationGroupsService,
  OrganizationsService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';
import { mockResizeObserver } from "../../../mocks/mock_resize_observer";
import { NgxEchartsModule } from "ngx-echarts";

describe('OrganizationComponent', () => {
  let component: OrganizationComponent;
  let fixture: ComponentFixture<OrganizationComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [OrganizationComponent],
      imports: [
        SharedComponentsModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        })
      ],
      providers: [
        HttpClient,
        HttpHandler,
        ExpenseItemsService,
        OrganizationsService,
        OrganizationGroupsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationComponent);
    component = fixture.componentInstance;
    fixture.whenStable().then(() => {
      fixture.detectChanges();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
