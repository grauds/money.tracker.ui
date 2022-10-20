import { Component, Input, OnInit } from '@angular/core';
import { AccountBalance } from '@clematis-shared/model';

@Component({
  selector: 'app-account-balance-item',
  templateUrl: './account-balance-item.component.html',
  styleUrls: ['./account-balance-item.component.css']
})
export class AccountBalanceItemComponent implements OnInit {

  @Input() balance: AccountBalance = new AccountBalance();

  constructor() { }

  ngOnInit(): void {}

}
