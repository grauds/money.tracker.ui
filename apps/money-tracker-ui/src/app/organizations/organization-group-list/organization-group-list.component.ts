import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OrganizationGroupsService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-organization-group-list',
  templateUrl: 'organization-group-list.component.html',
  styleUrls: ['organization-group-list.component.sass'],
  providers: [
    { provide: 'searchService', useClass: OrganizationGroupsService },
  ],
  standalone: false,
})
export class OrganizationGroupListComponent implements OnInit {
  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Organization Groups');
  }
}
