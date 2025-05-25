import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OrganizationsService } from '@clematis-shared/shared-components';

@Component({
  selector: 'app-organizations-list',
  templateUrl: 'organizations-list.component.html',
  styleUrls: ['organizations-list.component.sass'],
  providers: [{ provide: 'searchService', useClass: OrganizationsService }],
  standalone: false,
})
export class OrganizationsListComponent implements OnInit {
  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Organizations');
  }
}
