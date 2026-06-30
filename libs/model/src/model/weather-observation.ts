import { Resource } from '@lagoshny/ngx-hateoas-client';

/**
 * Strongly typed string-literal union matching the Java Enum values
 */
export type WindDirection =
  | 'N'
  | 'NNE'
  | 'NE'
  | 'ENE'
  | 'E'
  | 'ESE'
  | 'SE'
  | 'SSE'
  | 'S'
  | 'SSW'
  | 'SW'
  | 'WSW'
  | 'W'
  | 'WNW'
  | 'NW'
  | 'NNW'
  | 'CALM';

/**
 * Raw JSON shape mapping directly to the backend DTO property keys
 */
export interface RawObservationPayload {
  date: string | Date;
  t: number | null;
  po: number | null;
  p: number | null;
  pa: number | null;
  u: number | null;
  dd: WindDirection | null;
  ff: string | null;
  ff10: string | null;
  ff3: string | null;
  n: string | null;
  ww: string | null;
  w1: string | null;
  w2: string | null;
  tn: number | null;
  tx: number | null;
  cl: string | null;
  nh: string | null;
  h: string | null;
  cm: string | null;
  ch: string | null;
  vv: number | null;
  td: number | null;
  rrr: number | null;
  tr: number | null;
  e: string | null;
  tg: number | null;
  eApostrophe: string | null;
  sss: number | null;
}

/**
 * WeatherObservation domain model translating short keys into explicit names
 */
export class WeatherObservation extends Resource {
  date: Date;
  temperature: number | null;
  stationPressure: number | null;
  seaLevelPressure: number | null;
  pressureTendency: number | null;
  relativeHumidity: number | null;
  windDirection: WindDirection | null;
  windSpeed: string | null;
  windGustMax10m: string | null;
  windGustMaxBetweenObs: string | null;
  totalCloudCover: string | null;
  presentWeather: string | null;
  pastWeather1: string | null;
  pastWeather2: string | null;
  minTemperaturePastPeriod: number | null;
  maxTemperaturePastPeriod: number | null;
  lowCloudsGenera: string | null;
  lowestCloudAmount: string | null;
  lowestCloudBaseHeight: string | null;
  midCloudsGenera: string | null;
  highCloudsGenera: string | null;
  horizontalVisibilityKm: number | null;
  dewPointTemperature: number | null;
  precipitationAmountMm: number | null;
  precipitationAccumulationPeriod: number | null;
  groundStateNoSnow: string | null;
  minSoilSurfaceTempNight: number | null;
  groundStateWithSnow: string | null;
  snowDepthCm: number | null;

  constructor(data: Partial<RawObservationPayload>) {
    super()
    this.date = data.date ? new Date(data.date) : new Date();
    this.temperature = data.t ?? null;
    this.stationPressure = data.po ?? null;
    this.seaLevelPressure = data.p ?? null;
    this.pressureTendency = data.pa ?? null;
    this.relativeHumidity = data.u ?? null;
    this.windDirection = data.dd ?? null;
    this.windSpeed = data.ff ?? null;
    this.windGustMax10m = data.ff10 ?? null;
    this.windGustMaxBetweenObs = data.ff3 ?? null;
    this.totalCloudCover = data.n ?? null;
    this.presentWeather = data.ww ?? null;
    this.pastWeather1 = data.w1 ?? null;
    this.pastWeather2 = data.w2 ?? null;
    this.minTemperaturePastPeriod = data.tn ?? null;
    this.maxTemperaturePastPeriod = data.tx ?? null;
    this.lowCloudsGenera = data.cl ?? null;
    this.lowestCloudAmount = data.nh ?? null;
    this.lowestCloudBaseHeight = data.h ?? null;
    this.midCloudsGenera = data.cm ?? null;
    this.highCloudsGenera = data.ch ?? null;
    this.horizontalVisibilityKm = data.vv ?? null;
    this.dewPointTemperature = data.td ?? null;
    this.precipitationAmountMm = data.rrr ?? null;
    this.precipitationAccumulationPeriod = data.tr ?? null;
    this.groundStateNoSnow = data.e ?? null;
    this.minSoilSurfaceTempNight = data.tg ?? null;
    this.groundStateWithSnow = data.eApostrophe ?? null;
    this.snowDepthCm = data.sss ?? null;
  }
}
