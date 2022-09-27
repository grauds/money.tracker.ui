import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGroupComponent } from './organization-group.component';

describe('OrganizationGroupComponent', () => {
  let component: OrganizationGroupComponent;
  let fixture: ComponentFixture<OrganizationGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
