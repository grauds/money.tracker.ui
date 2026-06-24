import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { EnvironmentInterface } from './environment-interface';

export const ENVIRONMENT = new InjectionToken<{ [key: string]: string }>(
  'environment'
);

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private readonly environment: EnvironmentInterface;

  // We need @Optional to be able to start app without providing environment file
  constructor(
    @Optional() @Inject(ENVIRONMENT) environment: EnvironmentInterface,
  ) {
    this.environment =
      environment !== null ? environment : ({} as EnvironmentInterface);
  }

  getValue<T extends keyof EnvironmentInterface>(
    key: T,
    defaultValue?: EnvironmentInterface[T],
  ): EnvironmentInterface[T] {
    return this.environment[key] ?? defaultValue;
  }
}
