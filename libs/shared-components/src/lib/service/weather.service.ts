import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';
import { ResourceCollection } from '@lagoshny/ngx-hateoas-client';
import { WeatherObservation } from '@clematis-shared/model';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  environmentService: EnvironmentService;

  constructor(
    private http: HttpClient,
    environmentService: EnvironmentService,
  ) {
    this.environmentService = environmentService;
  }

  getDay(dayTime: string): Observable<ResourceCollection<WeatherObservation>> {
    const url = `/api/observations/search/findByStationDayAndHour?dateTime=${dayTime} 09:00:00&stationId=27612`;
    return this.http.get<ResourceCollection<WeatherObservation>>(
      this.getUrl(url),
    );
  }

  getImage(day: string): Observable<Blob> {
    const url = `/image/random?date=${day}`;
    return this.http.get(this.getUrl(url), {
      responseType: 'blob',
    });
  }

  getUrl(url: string): string {
    return this.environmentService.getValue('weatherUrl') + url;
  }
}
