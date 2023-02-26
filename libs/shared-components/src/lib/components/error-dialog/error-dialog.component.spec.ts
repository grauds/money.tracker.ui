import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorDialogComponent } from './error-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { ErrorDialogService } from "../../error/error-dialog.service";

describe('ErrorDialogComponent', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorDialogComponent ],
      imports: [ MatDialogModule ],
      providers: [ ErrorDialogService,
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
