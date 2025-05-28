import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedComponentsModule } from '@clematis-shared/shared-components';

import { LastCommoditiesListComponent } from './last-commodities-list.component';
import { of } from "rxjs";
import { ActivatedRoute, convertToParamMap } from "@angular/router";

const fakeActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    paramMap: convertToParamMap({ id: 9 }),
  },
} as ActivatedRoute;

describe('LastCommoditiesListComponent', () => {
  let component: LastCommoditiesListComponent;
  let fixture: ComponentFixture<LastCommoditiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedComponentsModule,
        HttpClientModule,
      ],
      declarations: [LastCommoditiesListComponent],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LastCommoditiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
