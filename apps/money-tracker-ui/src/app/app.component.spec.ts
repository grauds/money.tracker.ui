import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { KeycloakService } from "keycloak-angular";
import { ActivatedRoute, convertToParamMap } from "@angular/router";

describe('AppComponent', () => {

  const fakeActivatedRoute = {
    snapshot: { paramMap: convertToParamMap({ 'id': 9}) }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        KeycloakService,
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Money Tracker'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Money Tracker');
  });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('.content span')?.textContent).toContain('Money Tracker app is running!');
  // });
});
