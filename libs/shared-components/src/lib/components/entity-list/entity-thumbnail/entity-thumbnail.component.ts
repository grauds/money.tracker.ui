import { Component, Input } from '@angular/core';
import { Entity } from '@clematis-shared/model';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgClass } from '@angular/common';
import { AuthImagePipe } from "../../photo-uploader/AuthImagePipe";
import { StorageService } from "../../../service/storage.service";

@Component({
  selector: 'app-entity-thumbnail',
  standalone: true,
  templateUrl: './entity-thumbnail.component.html',
  styleUrls: ['./entity-thumbnail.component.sass'],
  imports: [
    RouterLink,
    AsyncPipe,
    AuthImagePipe,
    AuthImagePipe,
    NgClass,
  ],
})
export class EntityThumbnailComponent<T extends Entity> {
  private _entity!: T;

  @Input() entityName: string | undefined;

  @Input() currentLayout: 'grid' | 'list' = 'grid';

  entityLink: string | undefined;

  id = '';

  isImageLoading = true;

  constructor(private storageService: StorageService) {}

  get entity(): T {
    return this._entity;
  }

  @Input({ required: true })
  set entity(value: T) {
    this._entity = value;
    this.isImageLoading = true;
    this.entityLink = Entity.getRelativeSelfLinkHref(this._entity);
    this.id = Entity.getId(this._entity);
  }

  onImageLoad(): void {
    this.isImageLoading = false;
  }

  getImageUrl(): string {
    if (this.entity.name && this.entityName && this.id) {
      return this.storageService.getURL(this.entityName, this.id, 'main');
    } else {
      return 'assets/product-placeholder.png';
    }
  }
}
