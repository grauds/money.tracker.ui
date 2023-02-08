import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { CommoditiesService } from "@clematis-shared/shared-components";

@Component({
  selector: 'app-commodities-list',
  templateUrl: 'commodities-list.component.html',
  styleUrls: ['commodities-list.component.css'],
  providers: [
    { provide: 'searchService', useClass: CommoditiesService }
  ]
})
export class CommoditiesListComponent implements OnInit {

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Commodities')
  }

}
