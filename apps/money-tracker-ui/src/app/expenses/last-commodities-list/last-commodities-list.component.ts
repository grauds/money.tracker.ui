import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Utils } from '@clematis-shared/model';
import { LastCommodityService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-last-commodities-list',
  templateUrl: 'last-commodities-list.component.html',
  styleUrls: ['last-commodities-list.component.sass'],
  providers: [{ provide: 'searchService', useClass: LastCommodityService }],
  standalone: false,
})
export class LastCommoditiesListComponent implements OnInit {
  displayedColumns: string[] = [
    'daysAgo',
    'transferdate',
    'name',
    'price',
    'qty',
    'organizationname',
  ];

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Last Commodities');
  }

  getDaysAgo(daysAgo: number) {
    return Utils.getFormattedStringFromDays(daysAgo);
  }
}
