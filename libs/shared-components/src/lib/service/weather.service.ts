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
    const url = `/observations/search/findByStationDayAndHour?dateTime=${dayTime} 09:00:00&stationId=27612`;
    return this.http.get<ResourceCollection<WeatherObservation>>(
      this.getUrl(url),
    );
  }

  getUrl(url: string): string {
    return this.environmentService.getValue('weatherUrl') + url;
  }
}
