import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

  @Input() searchText = '';

  // change current search string event
  @Output() changeSearchString = new EventEmitter<string>();

  search(value: string) {
    this.searchText = value
    this.changeSearchString.emit(value);
  }
}
