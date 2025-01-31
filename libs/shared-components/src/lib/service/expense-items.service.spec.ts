import { TestBed } from '@angular/core/testing';

import { ExpenseItemsService } from './expense-items.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('ExpensesService', () => {
  let service: ExpenseItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpenseItemsService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(ExpenseItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
