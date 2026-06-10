// entity-thumbnail.component.ts
import { Component, Input, OnInit } from "@angular/core";
import { Entity } from '@clematis-shared/model';
import { Router, RouterLink } from "@angular/router";
import { AsyncPipe, NgOptimizedImage } from "@angular/common";
import { AuthImagePipe } from "../photo-uploader/AuthImagePipe";
import { StorageService } from "../../service/storage.service";

@Component({
  selector: "app-entity-thumbnail",
  standalone: true,
  templateUrl: "./entity-thumbnail.component.html",
  styleUrls: ['./entity-thumbnail.component.sass'],
  imports: [
    RouterLink,
    AsyncPipe,
    AuthImagePipe,
    NgOptimizedImage
  ]
})
export class EntityThumbnailComponent<T extends Entity> implements OnInit {
  @Input({ required: true }) entity!: T;

  entityLink: string | undefined;

  id = '';

  constructor(private router: Router,
              private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.entityLink = Entity.getRelativeSelfLinkHref(this.entity);
    this.id = this.entity.getId();
  }

  navigate = () => {
    this.router.navigate([this.entityLink]);
  };

  getImageUrl(): string {
    if (this.entity.name && this.id) {
      return this.storageService.getURL(
        'commodities',
        this.id,
        'main'
      );
    } else {
      return 'assets/product-placeholder.png';
    }
  }
}
