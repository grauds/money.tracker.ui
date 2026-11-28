import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  WordPressArticle,
  WordPressArticlePayload,
  WordPressTag,
} from '@clematis-shared/model';
import { WordpressService } from '@clematis-shared/shared-components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wordpress-article',
  imports: [DatePipe, FormsModule],
  templateUrl: './wordpress-article.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './wordpress-article.component.sass',
})
export class WordpressArticleComponent implements OnInit {
  @Input() wpArticle: WordPressArticle[] = [];
  @Input() date: string | undefined;
  @Output() articleSaved = new EventEmitter<void>();

  @ViewChild('titleArea') titleArea?: ElementRef<HTMLHeadingElement>;
  @ViewChild('editorArea') editorArea?: ElementRef<HTMLDivElement>;

  isEditing = signal(false);
  isCreatingNew = signal(false);
  editingArticleId = signal<number | null>(null);

  isSaving = signal(false);
  isUploading = signal(false);
  errorMessage = signal<string | null>(null);

  featuredMediaId = signal<number | undefined>(undefined);
  featuredImagePreview = signal<string | null>(null);
  selectedFigure = signal<HTMLElement | null>(null);

  availableTags = signal<WordPressTag[]>([]);
  selectedTagIds = signal<number[]>([]);
  newTagInput = signal('');

  filteredTags = computed(() => {
    const query = this.newTagInput().trim().toLowerCase();
    const selected = new Set(this.selectedTagIds());
    return this.availableTags().filter(
      (tag) =>
        !selected.has(tag.id) &&
        (!query || tag.name.toLowerCase().includes(query)),
    );
  });

  selectedTags = computed(() => {
    const selected = new Set(this.selectedTagIds());
    return this.availableTags().filter((tag) => selected.has(tag.id));
  });

  constructor(private wordpressService: WordpressService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.wordpressService.getTags().subscribe({
      next: (tags) => this.availableTags.set(tags),
      error: () => this.errorMessage.set('Не удалось загрузить список тегов.'),
    });
  }

  isArticleBeingEdited(articleId: number): boolean {
    return (
      this.isEditing() &&
      !this.isCreatingNew() &&
      this.editingArticleId() === articleId
    );
  }

  startCreate(): void {
    this.errorMessage.set(null);
    this.isCreatingNew.set(true);
    this.editingArticleId.set(null);
    this.selectedTagIds.set([]);
    this.featuredMediaId.set(undefined);
    this.featuredImagePreview.set(null);
    this.selectedFigure.set(null);
    this.isEditing.set(true);

    setTimeout(() => {
      if (this.titleArea) {
        this.titleArea.nativeElement.innerText = '';
        this.titleArea.nativeElement.focus();
      }
      if (this.editorArea) {
        this.editorArea.nativeElement.innerHTML = '<p><br></p>';
      }
    });
  }

  startEdit(article: WordPressArticle): void {
    this.errorMessage.set(null);
    this.isCreatingNew.set(false);
    this.editingArticleId.set(article.id);
    this.selectedTagIds.set(article.tags || []);
    this.featuredMediaId.set(
      article.featured_media ||
        article._embedded?.['wp:featuredmedia']?.find(() => true)?.id,
    );
    this.featuredImagePreview.set(article.featuredImageUrl || null);
    this.selectedFigure.set(null);
    this.isEditing.set(true);

    setTimeout(() => {
      if (this.titleArea) {
        this.titleArea.nativeElement.innerText = this.decodeHtml(
          article.title.rendered,
        );
      }
      if (this.editorArea) {
        this.editorArea.nativeElement.innerHTML =
          article.content.rendered?.trim() || '<p><br></p>';
      }
    });
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.isCreatingNew.set(false);
    this.editingArticleId.set(null);
    this.selectedFigure.set(null);
    this.errorMessage.set(null);
  }

  execFormat(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorArea?.nativeElement.focus();
  }

  onEditorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const figure = target.closest(
      'figure.wp-block-image',
    ) as HTMLElement | null;

    this.editorArea?.nativeElement
      .querySelectorAll('figure.wp-block-image.is-selected')
      .forEach((el) => el.classList.remove('is-selected'));

    if (figure) {
      figure.classList.add('is-selected');
      this.selectedFigure.set(figure);
    } else {
      this.selectedFigure.set(null);
    }
  }

  removeSelectedImage(): void {
    const fig = this.selectedFigure();
    if (fig) {
      fig.remove();
      this.selectedFigure.set(null);
    }
  }

  toggleTag(tagId: number): void {
    const current = this.selectedTagIds();
    if (current.includes(tagId)) {
      this.selectedTagIds.set(current.filter((id) => id !== tagId));
    } else {
      this.selectedTagIds.set([...current, tagId]);
    }
    this.newTagInput.set('');
  }

  addOrCreateTag(): void {
    const rawName = this.newTagInput().trim();
    if (!rawName) return;

    const existing = this.availableTags().find(
      (t) => t.name.toLowerCase() === rawName.toLowerCase(),
    );

    if (existing) {
      if (!this.selectedTagIds().includes(existing.id)) {
        this.selectedTagIds.update((ids) => [...ids, existing.id]);
      }
      this.newTagInput.set('');
      return;
    }

    this.wordpressService.createTag(rawName).subscribe({
      next: (createdTag) => {
        this.availableTags.update((tags) => [...tags, createdTag]);
        this.selectedTagIds.update((ids) => [...ids, createdTag.id]);
        this.newTagInput.set('');
      },
      error: () =>
        this.errorMessage.set(`Не удалось создать тег «${rawName}».`),
    });
  }

  onInlineImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) return;

    this.isUploading.set(true);
    this.wordpressService
      .uploadMedia(file, {
        postId: this.editingArticleId(),
        date: this.date,
      })
      .subscribe({
        next: (media) => {
          this.isUploading.set(false);
          this.insertImageIntoEditor(media.source_url, file.name);
          if (!this.featuredMediaId()) {
            this.featuredMediaId.set(media.id);
            this.featuredImagePreview.set(media.source_url);
          }
          input.value = '';
        },
        error: () => {
          this.isUploading.set(false);
          this.errorMessage.set('Ошибка загрузки изображения.');
          input.value = '';
        },
      });
  }

  onFeaturedImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) return;

    this.isUploading.set(true);
    this.wordpressService
      .uploadMedia(file, {
        postId: this.editingArticleId(),
        date: this.date,
      })
      .subscribe({
        next: (media) => {
          this.isUploading.set(false);
          this.featuredMediaId.set(media.id);
          this.featuredImagePreview.set(media.source_url);
          input.value = '';
        },
        error: () => {
          this.isUploading.set(false);
          this.errorMessage.set('Ошибка загрузки обложки.');
          input.value = '';
        },
      });
  }

  removeFeaturedImage(): void {
    this.featuredMediaId.set(0);
    this.featuredImagePreview.set(null);
  }

  private insertImageIntoEditor(url: string, alt: string): void {
    this.editorArea?.nativeElement.focus();
    const figureHtml = `<figure class="wp-block-image"><img src="${url}" alt="${alt}" /></figure><p><br></p>`;
    document.execCommand('insertHTML', false, figureHtml);
  }

  private getCleanEditorHtml(): string {
    if (!this.editorArea) return '';
    const clone = this.editorArea.nativeElement.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('.is-selected')
      .forEach((el) => el.classList.remove('is-selected'));
    return clone.innerHTML.trim();
  }

  saveArticle(): void {
    const rawTitle = this.titleArea?.nativeElement.innerText.trim() || '';
    const htmlContent = this.getCleanEditorHtml();

    if (!rawTitle) {
      this.errorMessage.set('Введите заголовок записи.');
      this.titleArea?.nativeElement.focus();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const payload: WordPressArticlePayload = {
      title: rawTitle,
      content: htmlContent,
      status: 'publish',
      tags: this.selectedTagIds(),
      ...(this.featuredMediaId() !== undefined
        ? { featured_media: this.featuredMediaId() }
        : {}),
    };

    const id = this.editingArticleId();

    if (id) {
      this.wordpressService.updateArticle(id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.cancelEdit();
          this.articleSaved.emit();
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMessage.set('Не удалось сохранить изменения.');
        },
      });
    } else {
      payload.date = this.buildWordpressDateString(this.date);

      this.wordpressService.createArticle(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.cancelEdit();
          this.articleSaved.emit();
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMessage.set('Не удалось создать запись.');
        },
      });
    }
  }

  getArticleTags(article: WordPressArticle): WordPressTag[] {
    return article._embedded?.['wp:term']?.find(() => true) || [];
  }

  private buildWordpressDateString(dateStr?: string): string {
    const target = (dateStr || new Date().toISOString())
      .split('T')
      .find(() => true);
    return `${target}T12:00:00`;
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
}
