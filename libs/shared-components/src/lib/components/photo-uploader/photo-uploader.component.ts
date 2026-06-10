import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { StorageService } from '../../service/storage.service';
import { AuthImagePipe } from "./AuthImagePipe";

@Component({
  selector: 'app-photo-uploader',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, NgOptimizedImage, AuthImagePipe, AuthImagePipe],
  templateUrl: './photo-uploader.component.html',
  styleUrls: ['./photo-uploader.component.css']
})
export class PhotoUploaderComponent {

  // all the data bound to a certain money tracker entity
  @Input() entityName!: string;
  @Input() entityId!: string;
  @Input() extraPath: string | undefined

  @Input() currentImageUrl: string | null = 'assets/product-placeholder.png';
  @Output() imageDeleted = new EventEmitter<void>();

  imageFileToCrop: File | undefined = undefined;
  croppedBlob: Blob | null = null;
  croppedPreviewUrl: string | null = null;
  isCroppingMode = false;
  isDraggingOver = false;

  scaleValue = 1;
  transform: ImageTransform = { scale: 1, translateH: 0, translateV: 0 };

  // Track coordinates for custom image panning mechanics
  private isPanningActive = false;
  private startMouseX = 0;
  private startMouseY = 0;
  private originalTranslateH = 0;
  private originalTranslateV = 0;

  constructor(private storageService: StorageService) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setupCropperWithFile(input.files[0]);
    }
  }

  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          this.setupCropperWithFile(file);
          break;
        }
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type.startsWith('image/')) {
        this.setupCropperWithFile(droppedFile);
      }
    }
  }

  private setupCropperWithFile(file: File): void {
    this.imageFileToCrop = file;
    this.scaleValue = 1;
    this.transform = { scale: 1, translateH: 0, translateV: 0 };
    this.isCroppingMode = true;
  }

  // --- REFACTORED: NATIVE MOUSE GESTURE CANVAS PANNING MECHANICS ---
  startPanning(event: MouseEvent): void {
    event.preventDefault();
    this.isPanningActive = true;

    // Save starting position coordinates
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;

    // Fallback to 0 if translate variables aren't established yet
    this.originalTranslateH = this.transform.translateH || 0;
    this.originalTranslateV = this.transform.translateV || 0;
  }

  @HostListener('window:mousemove', ['$event'])
  onPanning(event: MouseEvent): void {
    if (!this.isPanningActive) return;

    // Calculate standard client pixel track changes
    const deltaX = event.clientX - this.startMouseX;
    const deltaY = event.clientY - this.startMouseY;

    // Divide movement by scale factor to prevent image drifting or moving faster than the cursor
    const scale = this.scaleValue || 1;

    this.transform = {
      ...this.transform,
      translateH: this.originalTranslateH + (deltaX / scale),
      translateV: this.originalTranslateV + (deltaY / scale)
    };
  }

  @HostListener('window:mouseup')
  stopPanning(): void {
    this.isPanningActive = false;
  }
  // -------------------------------------------------------------

  onZoomChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.scaleValue = parseFloat(target.value);
    this.transform = { ...this.transform, scale: this.scaleValue };
  }

  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedBlob = event.blob;
      this.croppedPreviewUrl = event.objectUrl || URL.createObjectURL(event.blob);
    }
  }

  onUpload(): void {
    if (!this.croppedBlob) {
      return;
    }

    this.storageService.upload(this.entityName,
      this.entityId,
      this.croppedBlob,
      this.extraPath
    ).subscribe({
      next: (response) => {
        console.log('Upload successful!', response);

        // Break browser cache by appending a fresh timestamp to the image URL
        const timestamp = new Date().getTime();
        const baseApiUrl = this.storageService.getURL(
          this.entityName,
          this.entityId,
          this.extraPath
        );

        // This will force your template image to refresh instantly
        this.currentImageUrl = `${baseApiUrl}&t=${timestamp}`;

        this.resetCropper();
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }

  getImageUrl(): string {
    if (this.entityName && this.entityId) {
      return this.storageService.getURL(
        this.entityName,
        this.entityId,
        this.extraPath
      );
    } else {
      return 'assets/product-placeholder.png';
    }
  }

  onDelete(): void {
    this.currentImageUrl = 'assets/product-placeholder.png';
    this.resetCropper();
    this.imageDeleted.emit();
  }

  cancelEditing(): void {
    this.resetCropper();
  }

  private resetCropper(): void {
    this.imageFileToCrop = undefined;
    this.croppedBlob = null;
    this.croppedPreviewUrl = null;
    this.scaleValue = 1;
    this.transform = { scale: 1, translateH: 0, translateV: 0 };
    this.isCroppingMode = false;
    this.isDraggingOver = false;
  }
}
