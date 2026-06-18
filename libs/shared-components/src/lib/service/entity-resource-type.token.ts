import { InjectionToken, Type } from '@angular/core';
import { Entity } from "@clematis-shared/model";

export const RESOURCE_TYPE = new InjectionToken<Type<Entity>>(
  'RESOURCE_TYPE'
);

export const PARENT_RESOURCE_TYPE = new InjectionToken<Type<Entity>>(
  'PARENT_RESOURCE_TYPE'
);
