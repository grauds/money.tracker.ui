import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from './environment.service';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  environmentService: EnvironmentService;

  constructor(private http: HttpClient,
              environmentService: EnvironmentService
  ) {
    this.environmentService = environmentService;
  }

  getURL(entityName: string,
         entityId: string,
         extraPath?: string
  ): string {

    let entityRoot = `${entityName}/${entityId}`;

    // Safely append the extraPath if it exists and is not just empty spaces
    if (extraPath && extraPath.trim().length > 0) {
      // Ensure there is a single clean slash transition between entityId and extraPath
      const cleanExtraPath = extraPath.startsWith('/')
        ? extraPath.substring(1) : extraPath;
      entityRoot = `${entityRoot}?extraPath=${cleanExtraPath}`;
    }

    // Return the complete storage API URL endpoint
    return this.environmentService.getValue('storageUrl')
      + '/' + entityRoot;
  }

  upload(entityName: string,
         entityId: string,
         file: Blob,
         extraPath?: string
  ): Observable<any> {

    const formData = new FormData();

    formData.append('file', file);
    if (extraPath && extraPath.trim().length > 0) {
      formData.append('extraPath', extraPath);
    }

    return this.http.post<{ url: string }>(
      this.environmentService.getValue('storageUrl')
         + `/${entityName}/${entityId}/files`,
      formData
    );
  }
}
