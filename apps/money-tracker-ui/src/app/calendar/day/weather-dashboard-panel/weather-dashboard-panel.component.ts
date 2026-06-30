import { Component, Input } from '@angular/core';
import { WeatherObservation } from '@clematis-shared/model';

@Component({
  selector: 'app-weather-dashboard-panel',
  templateUrl: './weather-dashboard-panel.component.html',
  styleUrl: './weather-dashboard-panel.component.sass',
  standalone: false
})
export class WeatherDashboardPanelComponent {

  @Input() weatherData: WeatherObservation | undefined;

  /**
   * Maps present weather text keywords to matching icon strings.
   */
  getWeatherIcon(condition: string | null): string {
    if (!condition) {
      return 'pi pi-sun';
    }
    const text = condition.toLowerCase();
    if (text.includes('rain') || text.includes('drizzle')) {
      return 'pi pi-cloud-download';
    }
    if (text.includes('snow') || text.includes('ice')) {
      return 'pi pi-cloud';
    }
    if (text.includes('thunder') || text.includes('storm')) {
      return 'pi pi-bolt';
    }
    if (text.includes('cloud') || text.includes('overcast')) {
      return 'pi pi-cloud';
    }
    if (
      text.includes('fog') ||
      text.includes('mist') ||
      text.includes('haze')
    ) {
      return 'pi pi-align-justify';
    }
    return 'pi pi-sun'; // Default fallback icon
  }
  /**
   * Translates compass string points into CSS degree transforms.
   */
  getWindRotation(direction: string | null): string {
    const degrees: Record<string, string> = {
      N: 'rotate(0deg)',
      NNE: 'rotate(22.5deg)',
      NE: 'rotate(45deg)',
      ENE: 'rotate(67.5deg)',
      E: 'rotate(90deg)',
      ESE: 'rotate(112.5deg)',
      SE: 'rotate(135deg)',
      SSE: 'rotate(157.5deg)',
      S: 'rotate(180deg)',
      SSW: 'rotate(202.5deg)',
      SW: 'rotate(225deg)',
      WSW: 'rotate(247.5deg)',
      W: 'rotate(270deg)',
      WNW: 'rotate(292.5deg)',
      NW: 'rotate(315deg)',
      NNW: 'rotate(337.5deg)',
    };
    return direction
      ? degrees[direction.toUpperCase()] || 'rotate(0deg)'
      : 'rotate(0deg)';
  }
}
