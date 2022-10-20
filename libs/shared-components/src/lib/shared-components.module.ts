import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EntityElementComponent } from './components/entity-element/entity-element.component';
import { PaginationBarComponent } from './components/pagination-bar/pagination-bar.component';
import { PageSizeComponent } from './components/page-size/page-size.component';
import { SearchComponent } from './components/search/search.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [
    EntityElementComponent,
    BreadcrumbsComponent
  ],
  declarations: [
    BreadcrumbsComponent,
    EntityElementComponent,
    PaginationBarComponent,
    PageSizeComponent,
    SearchComponent
  ]
})
export class SharedComponentsModule {}
