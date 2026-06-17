import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entity } from '@clematis-shared/model';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}

import { EntityListFilteredComponent } from './entity-list-filtered.component';
import { SharedComponentsModule } from '../../shared-components.module';
import { CookieService } from "../../service/cookie.service";

describe('SearchComponent', () => {
  let component: EntityListFilteredComponent<Entity>;
  let fixture: ComponentFixture<EntityListFilteredComponent<Entity>>;
  let mockCookieService: jest.Mocked<Partial<CookieService>>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({}),
    },
  } as ActivatedRoute;

  beforeEach(async () => {

    mockCookieService = {
      setState: jest.fn(),
      getState: jest.fn().mockReturnValue(null)
    };

    await TestBed.configureTestingModule({
      declarations: [EntityListFilteredComponent],
      imports: [
        SharedComponentsModule
      ],
      providers: [
        {
          provide: 'searchService',
          useValue: {
            getStatusDescription() {
              return 'test';
            },
          },
        },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: CookieService, useValue: mockCookieService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityListFilteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
