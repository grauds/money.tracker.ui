import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentCommoditiesComponent } from './agent-commodities.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  MoneyTypeService,
  ExpenseItemsService,
} from '@clematis-shared/shared-components';
import { KeycloakService } from 'keycloak-angular';
import { of } from 'rxjs';

describe('AgentCommoditiesComponent', () => {
  let component: AgentCommoditiesComponent;
  let fixture: ComponentFixture<AgentCommoditiesComponent>;

  const fakeActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: convertToParamMap({ id: 9 }),
    },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentCommoditiesComponent],
      providers: [
        HttpClient,
        HttpHandler,
        MoneyTypeService,
        KeycloakService,
        ExpenseItemsService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCommoditiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
