import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedComponentsModule } from '@clematis-shared/shared-components';

import { OrganizationsListComponent } from './organizations-list.component';
import { of } from "rxjs";
import { ActivatedRoute, convertToParamMap } from "@angular/router";

const fakeActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    paramMap: convertToParamMap({}),
  },
} as ActivatedRoute;

describe('OrganizationsListComponent', () => {
  let component: OrganizationsListComponent;
  let fixture: ComponentFixture<OrganizationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedComponentsModule,
        HttpClientModule,
      ],
      declarations: [OrganizationsListComponent],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
