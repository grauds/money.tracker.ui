import { Component, OnInit } from '@angular/core';
import { AccountBalance } from '@clematis-shared/model';
import { MoneyTrackerService } from '@clematis-shared/money-tracker-service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  accountsBalances: AccountBalance[] = []

  constructor(private moneyTrackerService: MoneyTrackerService) { }

  ngOnInit(): void {
    this.loadData()
  }


  loadData() {
    this.moneyTrackerService.getAccountsBalance((response) => {

      this.accountsBalances = response.resources

    }, (error) => {

    })
  }
}
