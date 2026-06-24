import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TelegramFeedComponent } from './telegram-feed.component';

describe('TelegramFeedComponent', () => {
  let component: TelegramFeedComponent;
  let fixture: ComponentFixture<TelegramFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelegramFeedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TelegramFeedComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
