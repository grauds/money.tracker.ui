import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-pagination-bar',
  templateUrl: './pagination-bar.component.html',
  styleUrls: ['./pagination-bar.component.css']
})
export class PaginationBarComponent implements OnInit, OnChanges {

  @Input() path = '';

  // number of records per page
  @Input() itemsPerPage = 20;

  // use location bar of the browser to display search parameters
  @Input() useLocation = true;

  // current page number
  @Input() currentPage = 1;

  // total number of records
  @Input() total: number | undefined;

  // change current page event
  @Output() changeCurrentPage = new EventEmitter<number>();

  constructor(private router: Router) { }

  ngOnInit(): void {
    // should not be empty
  }

  ngOnChanges(changes: SimpleChanges): void {
    // should not be empty
  }

  prevPageDisabled() {
    return this.currentPage === 1 ? 'disabled' : '';
  }

  nextPageDisabled() {
    return this.currentPage >= this.pageCount() ? 'disabled' : '';
  }

  pageCount = () => {
    return this.total ? Math.ceil(this.total / this.itemsPerPage) : 1;
  };

  setCurrentPage = (currentPage: number) => {
    this.currentPage = currentPage
    if (this.useLocation) {
      this.router.navigate([this.path], { queryParams: {
          page: currentPage
        }, queryParamsHandling: 'merge'});
    } else {
      this.changeCurrentPage.emit(currentPage);
    }
  }

  lastPage() {
    this.setCurrentPage(this.pageCount());
  }

  nextPage() {
    if (this.currentPage < this.pageCount()) {
      this.setCurrentPage(this.currentPage + 1)
    }
  }

  setLocation(n: number) {
    if (n > 0 && n <= this.pageCount()) {
      this.setCurrentPage(n)
    } else if (n > this.pageCount()) {
      this.setCurrentPage(this.pageCount())
    } else if (n < 1) {
      this.setCurrentPage(1)
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.setCurrentPage(this.currentPage - 1)
    }
  }

  firstPage() {
    this.setCurrentPage(1)
  }

  range() {

    const pageCount = this.pageCount();
    const rangeSize = 5 < pageCount ? 5 : pageCount;
    let start: number;

    if (this.currentPage === 1 || this.currentPage === 2) {
      start = 1;
    } else if (this.currentPage > 2) {
      start = this.currentPage - 1;
    } else {
      start = this.currentPage;
    }

    if (start + rangeSize > pageCount + 1) {
      start = pageCount + 1 - rangeSize;
    }

    const ret = []

    const length: number = start + rangeSize
    for (let i = start; i < length; i++) {
      ret.push(i);
    }

    return ret;
  }
}
