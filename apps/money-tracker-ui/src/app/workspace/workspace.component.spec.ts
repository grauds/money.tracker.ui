import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, RouterModule } from "@angular/router";

import { WorkspaceComponent } from './workspace.component';

describe('WorkspaceComponent', () => {
  let component: WorkspaceComponent;
  let fixture: ComponentFixture<WorkspaceComponent>;

  const fakeActivatedRoute = {
    snapshot: { paramMap: convertToParamMap({ id: 19 }) },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        RouterModule.forRoot([{ path: '', component: WorkspaceComponent }]),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize timeline buckets starting from Jan 1, 1977 to the current year', () => {
    const buckets = component.timelineBuckets();
    const currentYear = new Date().getFullYear();
    const expectedCount = currentYear - 1977 + 1;

    expect(buckets.length).toBe(expectedCount);

    // Latest bucket is current year / Today
    const latestBucket = buckets[0];
    expect(latestBucket.year).toBe(currentYear);
    expect(latestBucket.label).toBe('Today');

    // Earliest bucket is 2000 starting from Jan 1, 2000
    const earliestBucket = buckets[buckets.length - 1];
    expect(earliestBucket.year).toBe(1977);
    expect(earliestBucket.id).toBe('1977-01-01');
    expect(earliestBucket.label).toBe('Jan 1, 1977');
    expect(earliestBucket.yearLabel).toBe('1977');
  });
});
