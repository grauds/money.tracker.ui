import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from "rxjs";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";

import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { OrganizationGroupListComponent } from './organization-group-list.component';
import { OrganizationGroupsService } from '@clematis-shared/shared-components';

const fakeActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    paramMap: convertToParamMap({}),
  },
} as ActivatedRoute;

describe('OrganizationGroupListComponent', () => {
  let component: OrganizationGroupListComponent;
  let fixture: ComponentFixture<OrganizationGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationGroupListComponent],
      imports: [
        SharedComponentsModule,
        HttpClientModule,
      ],
      providers: [
        OrganizationGroupsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
