import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { DateBreadcrumbsComponent } from './date-breadcrumbs.component';
import { RouterModule } from '@angular/router';

describe('DateBreadcrumbsComponent', () => {
  let component: DateBreadcrumbsComponent;
  let fixture: ComponentFixture<DateBreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateBreadcrumbsComponent],
      imports: [
        MatIconModule,
        RouterModule.forRoot([
          { path: '', component: DateBreadcrumbsComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DateBreadcrumbsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
