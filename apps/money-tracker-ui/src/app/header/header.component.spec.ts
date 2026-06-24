import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from "@angular/router";

import Keycloak from 'keycloak-js';

import { HeaderComponent } from './header.component';
import { MockKeycloak } from '../../mocks/mock_keycloak';
import { MoneyTypeService } from '@clematis-shared/shared-components';
import { mockMoneyTypeService } from '../../test-setup';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const keycloakServiceMock: MockKeycloak = new MockKeycloak();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatListModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
        { provide: Keycloak, useValue: keycloakServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
