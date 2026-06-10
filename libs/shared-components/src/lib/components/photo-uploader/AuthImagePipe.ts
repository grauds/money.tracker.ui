import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, map, of, catchError } from "rxjs";

@Pipe({
  name: 'authImage',
  standalone: true
})
export class AuthImagePipe implements PipeTransform {
  constructor(private http: HttpClient) {
  }

  transform(url: string | null | undefined): Observable<string> {
    const fallbackPath = 'assets/product-placeholder.png';

    if (!url) {
      return of(fallbackPath);
    }

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => {
        // Successfully fetched from Spring backend, create blob string
        return URL.createObjectURL(blob);
      }),
      // Intercept the 404 response before it registers as a network crash
      catchError((error: HttpErrorResponse) => {
        console.log(`Image not found on backend (${error.status}), serving fallback asset gracefully.`);
        // Return your local static placeholder as a healthy stream emission
        return of(fallbackPath);
      })
    );
  }
}
