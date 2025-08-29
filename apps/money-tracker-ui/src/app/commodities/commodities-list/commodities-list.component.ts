import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommoditiesService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-commodities-list',
  templateUrl: 'commodities-list.component.html',
  styleUrls: ['commodities-list.component.sass'],
  providers: [{ provide: 'searchService', useClass: CommoditiesService }],
  standalone: false,
})
export class CommoditiesListComponent implements OnInit {
  constructor(private readonly title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Commodities');
  }
}
