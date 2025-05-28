import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutListComponent } from './in-out-list.component';
import {
  InOutService,
  MoneyTypeService,
  SharedComponentsModule,
} from '@clematis-shared/shared-components';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { of } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxEchartsModule } from "ngx-echarts";
import { mockResizeObserver } from "../../../mocks/mock_resize_observer";

const fakeActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    paramMap: convertToParamMap({ id: 9 }),
  },
} as ActivatedRoute;

describe('InOutListComponent', () => {
  let component: InOutListComponent;
  let fixture: ComponentFixture<InOutListComponent>;

  beforeEach(async () => {
    global.ResizeObserver = mockResizeObserver;

    await TestBed.configureTestingModule({
      declarations: [InOutListComponent],
      imports: [
        SharedComponentsModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        NgxEchartsModule.forRoot({
          echarts: () => import("echarts")
        }),
      ],
      providers: [
        InOutService,
        HttpClient,
        HttpHandler,
        MediaMatcher,
        MoneyTypeService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InOutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
