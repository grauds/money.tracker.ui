import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGroupListComponent } from './organization-group-list.component';
import { OrganizationGroupsService } from "@clematis-shared/shared-components";

describe('OrganizationGroupListComponent', () => {
  let component: OrganizationGroupListComponent;
  let fixture: ComponentFixture<OrganizationGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationGroupListComponent],
      providers: [
        OrganizationGroupsService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
