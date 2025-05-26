import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';

import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  SharedComponentsModule,
  StatsService,
} from '@clematis-shared/shared-components';

import Keycloak from "keycloak-js";
import { KEYCLOAK_EVENT_SIGNAL } from "keycloak-angular";
import { mockEventSignal, MockKeycloak } from "../../mocks/mock_keycloak";


describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
      imports: [SharedComponentsModule],
      providers: [
        { provide: Keycloak, useValue: MockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: mockEventSignal },
        HttpClient,
        HttpHandler,
        StatsService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
