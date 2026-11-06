import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getURL', () => {
    it('should construct URL with entity name and ID', () => {
      const result = service.getURL('entities', '123');
      expect(result).toContain('entities/123');
    });

    it('should add extraPath with query parameter when provided', () => {
      const result = service.getURL('entities', '123', 'thumbnail');
      expect(result).toContain('extraPath=thumbnail');
    });

    it('should clean extraPath leading slash when provided', () => {
      const result = service.getURL('entities', '123', '/thumbnail');
      expect(result).toContain('extraPath=thumbnail');
      expect(result).not.toContain('extraPath=/thumbnail');
    });

    it('should not add extraPath when empty string provided', () => {
      const result = service.getURL('entities', '123', '');
      expect(result).not.toContain('extraPath');
    });

    it('should not add extraPath when whitespace only provided', () => {
      const result = service.getURL('entities', '123', '   ');
      expect(result).not.toContain('extraPath');
    });
  });
});
