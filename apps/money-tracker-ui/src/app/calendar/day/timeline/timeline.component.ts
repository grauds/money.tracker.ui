import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface TimelineBucket {
  id: string; // Raw path date string like '2007-03-10' or '2000-01-01'
  label: string; // Tooltip / bubble label string like 'Mar 10, 2007' or 'Jan 1, 2000'
  year: number;
  yearLabel?: string; // Visible label on the rail (e.g. '2026', '2000')
}

@Component({
  selector: 'app-timeline-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.sass'],
})
export class TimelineComponent {
  @Input() buckets: TimelineBucket[] = [];
}
