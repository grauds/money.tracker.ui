import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordpressArticleComponent } from './wordpress-article.component';

describe('WordpressArticleComponent', () => {
  let component: WordpressArticleComponent;
  let fixture: ComponentFixture<WordpressArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordpressArticleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordpressArticleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
