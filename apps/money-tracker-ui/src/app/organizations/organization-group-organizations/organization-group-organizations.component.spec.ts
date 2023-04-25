import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGroupOrganizationsComponent } from './organization-group-organizations.component';

describe('OrganizationGroupOrganizationsComponent', () => {
  let component: OrganizationGroupOrganizationsComponent;
  let fixture: ComponentFixture<OrganizationGroupOrganizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationGroupOrganizationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupOrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
