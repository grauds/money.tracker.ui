import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WordPressArticle } from '@clematis-shared/model';

@Component({
  selector: 'lib-wordpress-article',
  templateUrl: './wordpress-article.component.html',
  styleUrl: './wordpress-article.component.sass',
  standalone: false
})
export class WordpressArticleComponent {
  @Input() article!: WordPressArticle;
  safeContent!: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.article?.content?.rendered) {
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(
        this.article.content.rendered,
      );
    }
  }
}
