import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @Input()
  searchText: string = '';

  // change current search string event
  @Output() changeSearchString = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  search(value: string) {
    this.searchText = value
    this.changeSearchString.emit(value);
  }
}
