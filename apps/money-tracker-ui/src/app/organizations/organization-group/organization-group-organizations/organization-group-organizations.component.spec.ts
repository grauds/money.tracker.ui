import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedComponentsModule } from "@clematis-shared/shared-components";
import { OrganizationGroupOrganizationsComponent } from './organization-group-organizations.component';
import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { fakeActivatedRoute } from '../../../../test-setup';

describe('OrganizationGroupOrganizationsComponent', () => {
  let component: OrganizationGroupOrganizationsComponent;
  let fixture: ComponentFixture<OrganizationGroupOrganizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedComponentsModule,
        HttpClientModule
      ],
      declarations: [OrganizationGroupOrganizationsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationGroupOrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
