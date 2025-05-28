import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from "@angular/router";

import { HeaderComponent } from './header.component';
import { WorkspaceComponent } from '../workspace/workspace.component';

import { MockKeycloak } from '../../mocks/mock_keycloak';
import Keycloak from 'keycloak-js';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const keycloakServiceMock: MockKeycloak = new MockKeycloak();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkspaceComponent, HeaderComponent],
      imports: [
        MatSidenavModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatListModule,
        RouterModule.forRoot([{ path: '', component: HeaderComponent }]),
      ],
      providers: [
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
