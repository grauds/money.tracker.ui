import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationBarComponent } from './pagination-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

describe('PaginationBarComponent', () => {
  let component: PaginationBarComponent;
  let fixture: ComponentFixture<PaginationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaginationBarComponent ],
      imports: [ HttpClientModule, RouterModule.forRoot(
        [
          { path: "", component: PaginationBarComponent}
        ]
      )]
    })
    .compileComponents();
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
    component.setCurrentPage(2)
    component.itemsPerPage = 20
    component.total = 209
    component.useLocation = true

    expect(component.pageCount()).toEqual(11)
    expect(component.range()).toEqual([1, 2, 3, 4, 5])
    expect(component.currentPage).toEqual(2)
  })

  it('last page', () => {
    component.setCurrentPage(11)
    component.itemsPerPage = 20
    component.total = 209
    component.useLocation = true

    expect(component.pageCount()).toEqual(11)
    expect(component.range()).toEqual([7, 8, 9, 10, 11])
    expect(component.currentPage).toEqual(11)
  })

  it('next page without total', () => {
    component.setCurrentPage(11)
    component.itemsPerPage = 20
    component.total = 0
    component.useLocation = true

    expect(component.pageCount()).toEqual(1)
    expect(component.range()).toEqual([1])
    expect(component.currentPage).toEqual(11)
  })

  it('next page with total', () => {
    component.setCurrentPage(1)
    component.itemsPerPage = 20
    component.total = 13
    component.useLocation = true

    expect(component.pageCount()).toEqual(1)
    expect(component.range()).toEqual([1])
    expect(component.currentPage).toEqual(1)
  })
});
