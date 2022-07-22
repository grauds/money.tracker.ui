import { Component, OnInit } from '@angular/core';
import { HateoasResourceService } from '@lagoshny/ngx-hateoas-client';
import {TotalsStatisticsService} from "../common/services/totals-statistics.service";
import {Commodity} from "../common/model/commodity";
import {AccountBalance} from "../common/model/account-balance";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  accountsBalances: AccountBalance[] = []

  constructor(private totalsStats: TotalsStatisticsService) { }

  ngOnInit(): void {
    this.loadData()
  }


  loadData() {
    this.totalsStats.getAccountsBalance((response) => {

      this.accountsBalances = response.resources

    }, (error) => {

    })
  }
}
