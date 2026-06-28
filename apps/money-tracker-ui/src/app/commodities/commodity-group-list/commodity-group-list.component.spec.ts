import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { CommodityGroupListComponent } from './commodity-group-list.component';
import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { fakeActivatedRoute } from '../../../test-setup';

describe('CommodityGroupListComponent', () => {
  let component: CommodityGroupListComponent;
  let fixture: ComponentFixture<CommodityGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommodityGroupListComponent],
      imports: [SharedComponentsModule],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
