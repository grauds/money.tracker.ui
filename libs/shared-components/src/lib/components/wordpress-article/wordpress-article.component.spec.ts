import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { WordPressArticle } from '@clematis-shared/model';
import { WordpressArticleComponent } from './wordpress-article.component';

describe('WordpressArticleComponent', () => {
  let component: WordpressArticleComponent;
  let fixture: ComponentFixture<WordpressArticleComponent>;
  let sanitizer: DomSanitizer;

  const mockArticle: WordPressArticle = {
    id: 101,
    title: { rendered: 'Test Article Title' },
    date: '2026-07-21T12:00:00',
    content: {
      rendered:
        '<p>Text content</p><ul class="wp-block-gallery">' +
        '<li class="wp-block-image"><img src="img.jpg"></li></ul>',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WordpressArticleComponent],
      providers: [
        DatePipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: jest.fn((html) => html),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WordpressArticleComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process and render raw galleries safely', () => {
    component.article = mockArticle;
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(
      mockArticle.content.rendered,
    );
    expect(compiled.querySelector('.wp-block-gallery')).toBeTruthy();
  });
});
