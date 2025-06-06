import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommodityGroupsService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-commodity-group-list',
  templateUrl: 'commodity-group-list.component.html',
  styleUrls: ['commodity-group-list.component.sass'],
  providers: [{ provide: 'searchService', useClass: CommodityGroupsService }],
  standalone: false,
})
export class CommodityGroupListComponent implements OnInit {
  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Commodity Groups');
  }
}
