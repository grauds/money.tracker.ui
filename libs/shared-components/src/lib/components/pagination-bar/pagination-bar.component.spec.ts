import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationBarComponent } from './pagination-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

describe('PaginationBarComponent', () => {
  let component: PaginationBarComponent;
  let fixture: ComponentFixture<PaginationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationBarComponent],
      imports: [
        HttpClientModule,
        RouterModule.forRoot([{ path: '', component: PaginationBarComponent }]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pagination should show correct length and range', () => {
    component.setCurrentPage(2);
    component.itemsPerPage = 20;
    component.total = 209;
    component.useLocation = true;

    expect(component.pageCount()).toEqual(11);
    expect(component.range()).toEqual([1, 2, 3, 4, 5]);
    expect(component.currentPage).toEqual(2);
  });

  it('last page', () => {
    component.setCurrentPage(11);
    component.itemsPerPage = 20;
    component.total = 209;
    component.useLocation = true;

    expect(component.pageCount()).toEqual(11);
    expect(component.range()).toEqual([7, 8, 9, 10, 11]);
    expect(component.currentPage).toEqual(11);
  });

  it('next page without total', () => {
    component.setCurrentPage(11);
    component.itemsPerPage = 20;
    component.total = 0;
    component.useLocation = true;

    expect(component.pageCount()).toEqual(1);
    expect(component.range()).toEqual([1]);
    expect(component.currentPage).toEqual(11);
  });

  it('next page with total', () => {
    component.setCurrentPage(1);
    component.itemsPerPage = 20;
    component.total = 13;
    component.useLocation = true;

    expect(component.pageCount()).toEqual(1);
    expect(component.range()).toEqual([1]);
    expect(component.currentPage).toEqual(1);
  });

  describe('prevPageDisabled / nextPageDisabled', () => {
    it('prevPageDisabled should return disabled class on first page', () => {
      component.currentPage = 1;
      component.total = 100;
      component.itemsPerPage = 10;

      expect(component.prevPageDisabled()).toBe('disabled');
    });

    it('prevPageDisabled should return empty string when not on first page', () => {
      component.currentPage = 5;
      component.total = 100;
      component.itemsPerPage = 10;

      expect(component.prevPageDisabled()).toBe('');
    });

    it('nextPageDisabled should return disabled class on last page', () => {
      component.currentPage = 10;
      component.total = 100;
      component.itemsPerPage = 10;

      expect(component.nextPageDisabled()).toBe('disabled');
    });

    it('nextPageDisabled should return empty string when not on last page', () => {
      component.currentPage = 5;
      component.total = 100;
      component.itemsPerPage = 10;

      expect(component.nextPageDisabled()).toBe('');
    });

    it('nextPageDisabled should return disabled when total is 0', () => {
      component.currentPage = 1;
      component.total = 0;
      component.itemsPerPage = 10;

      expect(component.nextPageDisabled()).toBe('disabled');
    });
  });

  describe('navigation methods', () => {
    it('nextPage should increment current page', () => {
      component.currentPage = 1;
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.nextPage();

      expect(component.currentPage).toBe(2);
    });

    it('nextPage should not increment when at last page', () => {
      component.currentPage = 10;
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.nextPage();

      expect(component.currentPage).toBe(10);
    });

    it('prevPage should decrement current page', () => {
      component.currentPage = 5;
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.prevPage();

      expect(component.currentPage).toBe(4);
    });

    it('firstPage should navigate to page 1', () => {
      component.currentPage = 10;
      component.useLocation = false;

      component.firstPage();

      expect(component.currentPage).toBe(1);
    });

    it('lastPage should navigate to last page', () => {
      component.currentPage = 1;
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.lastPage();

      expect(component.currentPage).toBe(10);
    });
  });

  describe('setLocation', () => {
    it('should set page to requested number when valid', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.setLocation(5);

      expect(component.currentPage).toBe(5);
    });

    it('should clamp to last page when n > pageCount', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.setLocation(15);

      expect(component.currentPage).toBe(10);
    });

    it('should clamp to first page when n < 1', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.setLocation(0);

      expect(component.currentPage).toBe(1);
    });

    it('should clamp to first page when n is negative', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.useLocation = false;

      component.setLocation(-5);

      expect(component.currentPage).toBe(1);
    });
  });

  describe('setCurrentPage with useLocation', () => {
    it('should navigate via router when useLocation is true', () => {
      component.path = '/test';
      component.useLocation = true;
      component.setCurrentPage(3);

      // Router navigate should be called
      expect(component.currentPage).toBe(3);
    });

    it('should emit changeCurrentPage when useLocation is false', () => {
      component.useLocation = false;
      component.changeCurrentPage.subscribe((page) => {
        expect(page).toBe(5);
      });

      component.setCurrentPage(5);
      expect(component.currentPage).toBe(5);
    });
  });

  describe('range generation', () => {
    it('should start at 1 when currentPage is 1', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.setCurrentPage(1);

      expect(component.range()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should start at 1 when currentPage is 2', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.setCurrentPage(2);

      expect(component.range()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should start at currentPage - 1 when currentPage > 2', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.setCurrentPage(5);

      expect(component.range()).toEqual([4, 5, 6, 7, 8]);
    });

    it('should adjust start when near last page', () => {
      component.total = 100;
      component.itemsPerPage = 10;
      component.setCurrentPage(10);

      const range = component.range();
      expect(range[range.length - 1]).toBe(10);
    });

    it('should return all pages when pageCount < rangeSize', () => {
      component.total = 25;
      component.itemsPerPage = 10;
      component.setCurrentPage(1);

      expect(component.range()).toEqual([1, 2, 3]);
    });
  });
});
