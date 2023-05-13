import { TestBed } from '@angular/core/testing';

import { IncomeItemsService } from './income-items.service';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { MoneyTypeService } from "@clematis-shared/shared-components";

describe('IncomeItemsService', () => {
  let service: IncomeItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({

      providers: [
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        IncomeItemsService
     ]
    });
    service = TestBed.inject(IncomeItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
