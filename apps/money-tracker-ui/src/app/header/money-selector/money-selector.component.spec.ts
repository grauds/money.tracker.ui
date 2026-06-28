import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneySelectorComponent } from './money-selector.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MoneyTypeService } from '@clematis-shared/shared-components';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import { fakeActivatedRoute, mockHateoasService, mockMoneyTypeService } from '../../../test-setup';

describe('MoneySelectorComponent', () => {
  let component: MoneySelectorComponent;
  let fixture: ComponentFixture<MoneySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneySelectorComponent],
      providers: [
        { provide: HateoasResourceService, useValue: mockHateoasService },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: MoneyTypeService, useValue: mockMoneyTypeService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoneySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
