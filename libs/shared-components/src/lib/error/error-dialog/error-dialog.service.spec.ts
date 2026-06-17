import { TestBed } from '@angular/core/testing';

import { ErrorDialogService } from './error-dialog.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

describe('ErrorDialogService', () => {
  let service: ErrorDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [ErrorDialogService, MatDialog],
    });
    service = TestBed.inject(ErrorDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
