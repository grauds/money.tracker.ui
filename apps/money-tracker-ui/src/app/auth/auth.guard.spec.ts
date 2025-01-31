import { TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { HeaderComponent } from '../header/header.component';
import { KeycloakService } from 'keycloak-angular';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [KeycloakService],
    }).compileComponents();
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
