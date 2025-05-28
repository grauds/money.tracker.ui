import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { RouterModule } from "@angular/router";

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreadcrumbsComponent],
      imports: [
        MatIconModule,
        RouterModule.forRoot([{ path: '', component: BreadcrumbsComponent }]),
      ],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
