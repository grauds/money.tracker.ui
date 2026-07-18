import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ImmichService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.sass',
})
export class PhotoGalleryComponent implements OnInit {
  private immichService = inject(ImmichService);

  // Signal-based inputs introduced in modern Angular
  date = input.required<string>(); // Format: YYYY-MM-DD
  qty = input<number>(19); // Default to 19 photos

  // State signals
  imageUrls = signal<string[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  ngOnInit(): void {
    this.loadRandomRibbon();
  }

  private loadRandomRibbon(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.immichService.getRandomPhotos(this.date(), this.qty()).subscribe({
      next: (assets) => {
        if (!assets || assets.length === 0) {
          this.isLoading.set(false);
          return;
        }

        const thumbnailRequests = assets.map((asset) =>
          this.immichService.getThumbnailUrl(asset.id),
        );

        forkJoin(thumbnailRequests).subscribe({
          next: (urls: string[]) => {
            this.imageUrls.set(urls);
            this.isLoading.set(false);
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
