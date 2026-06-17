import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ExpensesListComponent } from './expenses-list.component';

describe('ExpensesListComponent', () => {
  let component: ExpensesListComponent;
  let fixture: ComponentFixture<ExpensesListComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpensesListComponent],
      imports: [SharedComponentsModule],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
