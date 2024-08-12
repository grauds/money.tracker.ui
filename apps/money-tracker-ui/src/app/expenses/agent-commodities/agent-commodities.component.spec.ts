import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentCommoditiesComponent } from './agent-commodities.component';

describe('AgentCommoditiesComponent', () => {
  let component: AgentCommoditiesComponent;
  let fixture: ComponentFixture<AgentCommoditiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentCommoditiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCommoditiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
