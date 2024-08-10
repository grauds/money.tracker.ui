import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'app-clematis-shared-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.sass'],
})
export class PageNotFoundComponent {
  constructor(private router: Router) {
    const url = decodeURIComponent(this.router.url);
    if (url !== this.router.url) {
      this.router.navigateByUrl(url);
    }
  }
}
