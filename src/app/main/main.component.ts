import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import {CommodityGroup} from "../model/commodity-group";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private resourceService: HateoasResourceService) { }

  ngOnInit(): void {

    this.resourceService.getPage(CommodityGroup).subscribe((page) => {

    });
  }

}
