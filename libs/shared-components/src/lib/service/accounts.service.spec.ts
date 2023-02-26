import { TestBed } from '@angular/core/testing';
import { AccountsService } from './accounts.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountsService, HttpClient, HttpHandler]
    });
    service = TestBed.inject(AccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
