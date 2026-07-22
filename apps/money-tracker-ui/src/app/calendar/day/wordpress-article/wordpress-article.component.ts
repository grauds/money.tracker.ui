import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WordPressArticle } from '@clematis-shared/model';

@Component({
  selector: 'app-wordpress-article',
  imports: [DatePipe],
  templateUrl: './wordpress-article.component.html',
  styleUrl: './wordpress-article.component.sass',
})
export class WordpressArticleComponent {
  @Input() wpArticle: WordPressArticle[] = [];
}
