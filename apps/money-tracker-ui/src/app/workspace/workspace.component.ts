import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Utils } from '@clematis-shared/model';
import { TimelineBucket, TimelineComponent } from '../calendar/day/timeline/timeline.component';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.sass'],
  imports: [RouterOutlet, TimelineComponent],
})
export class WorkspaceComponent implements OnInit {
  timelineBuckets = signal<TimelineBucket[]>([]);

  ngOnInit(): void {
    this.timelineBuckets.set(this.generateTimelineBuckets());
  }

  generateTimelineBuckets(): TimelineBucket[] {
    const startYear = 2000;
    const today = new Date();
    const currentYear = today.getFullYear();
    const todayFormatted = Utils.formatDate(today);
    const buckets: TimelineBucket[] = [];

    for (let year = currentYear; year >= startYear; year--) {
      if (year === currentYear) {
        buckets.push({
          id: todayFormatted,
          label: 'Today',
          year: year,
          yearLabel: `${year}`,
        });
      } else {
        buckets.push({
          id: `${year}-01-01`,
          label: `Jan 1, ${year}`,
          year: year,
          yearLabel: `${year}`,
        });
      }
    }

    return buckets;
  }
}
