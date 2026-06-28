import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { SharedComponentsModule } from '@clematis-shared/shared-components';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CommoditiesListComponent } from './commodities-list.component';
import { fakeActivatedRoute } from '../../../test-setup';

describe('CommoditiesListComponent', () => {
  let component: CommoditiesListComponent;
  let fixture: ComponentFixture<CommoditiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommoditiesListComponent],
      imports: [SharedComponentsModule],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommoditiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
