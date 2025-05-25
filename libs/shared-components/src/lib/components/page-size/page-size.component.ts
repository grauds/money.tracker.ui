import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-size',
  templateUrl: './page-size.component.html',
  styleUrls: ['./page-size.component.css'],
  standalone: false
})
export class PageSizeComponent implements OnInit, OnChanges {
  @Input() path = '';

  // total number of records
  @Input() total: number | undefined;

  // number of records per page
  @Input() itemsPerPage = 20;

  // current page number
  @Input()
  currentPage = 0;

  // use location bar of the browser to display search parameters
  @Input() useLocation = true;

  // change current page event
  @Output() changeCurrentPage = new EventEmitter<number>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // should not be empty
  }

  ngOnChanges(changes: SimpleChanges): void {
    // should not be empty
  }

  setCurrentPage = (currentPage: number) => {
    this.currentPage = currentPage;
    if (this.useLocation) {
      this.router.navigate([this.path], {
        queryParams: {
          page: currentPage,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.changeCurrentPage.emit(currentPage);
    }
  };

  setPageSize = (pageSize: number) => {
    this.itemsPerPage = pageSize;
    if (this.useLocation) {
      this.router.navigate([this.path], {
        queryParams: {
          size: pageSize,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.changeCurrentPage.emit(pageSize);
    }
  };

  pageCount = () => {
    return this.total ? Math.ceil(this.total / this.itemsPerPage) : 1;
  };
}
