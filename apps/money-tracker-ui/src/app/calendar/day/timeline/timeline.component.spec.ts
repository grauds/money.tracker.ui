import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { TimelineComponent, TimelineBucket } from './timeline.component';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let router: Router;

  const mockBuckets: TimelineBucket[] = [
    { id: '2007-03-10', label: 'March 10, 2007', year: 2007 },
    { id: '2007-03-11', label: 'March 11, 2007', year: 2007 },
    { id: '2008-05-20', label: 'May 20, 2008', year: 2008 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineComponent],
      providers: [
        // Clean modern routing injection strategy
        provideRouter([{ path: 'days/:date', redirectTo: '' }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Assign template inputs safely via modern programmatic signal/ref binding
    fixture.componentRef.setInput('buckets', mockBuckets);
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of timeline ticks', () => {
    const ticks = fixture.debugElement.queryAll(By.css('.timeline-tick'));
    expect(ticks.length).toBe(mockBuckets.length);
  });

  it('should output correct bubble labels in the DOM framework', () => {
    const labelElements = fixture.debugElement.queryAll(
      By.css('.bubble-label'),
    );
    expect(labelElements[0].nativeElement.textContent.trim()).toBe(
      'March 10, 2007',
    );
    expect(labelElements[2].nativeElement.textContent.trim()).toBe(
      'May 20, 2008',
    );
  });

  it('should output visible year labels in the timeline rail', () => {
    const yearLabels = fixture.debugElement.queryAll(
      By.css('.year-label'),
    );
    expect(yearLabels.length).toBe(mockBuckets.length);
    expect(yearLabels[0].nativeElement.textContent.trim()).toBe('2007');
    expect(yearLabels[2].nativeElement.textContent.trim()).toBe('2008');
  });

  it('should generate correct href navigation paths dynamically', () => {
    const tickElements = fixture.debugElement.queryAll(
      By.css('.timeline-tick'),
    );

    expect(tickElements[0].nativeElement.getAttribute('href')).toBe(
      '/days/2007-03-10',
    );
    expect(tickElements[2].nativeElement.getAttribute('href')).toBe(
      '/days/2008-05-20',
    );
  });

  it('should navigate to the targeted route address on user interaction click', async () => {
    // Query the target template element anchor link
    const firstTick = fixture.debugElement.query(By.css('.timeline-tick'));

    // Extract the calculated anchor target URL directly from the rendered DOM node
    const destinationHref = firstTick.nativeElement.getAttribute('href');

    // Verify it evaluates perfectly to your application path matching string
    expect(destinationHref).toBe('/days/2007-03-10');
  });

  it('should gracefully handle empty layout configurations without breaking', () => {
    fixture.componentRef.setInput('buckets', []);
    fixture.detectChanges();

    const ticks = fixture.debugElement.queryAll(By.css('.timeline-tick'));
    expect(ticks.length).toBe(0);
  });
});
