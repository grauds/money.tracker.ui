import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ImmichService } from './immich.service';
import { EnvironmentService } from './environment.service';
import { ImmichAsset } from './immich.models';

describe('ImmichService', () => {
  let service: ImmichService;
  let httpMock: HttpTestingController;
  let environmentServiceMock: jest.Mocked<EnvironmentService>;

  const mockBaseUrl = 'http://localhost:2283/api';

  const mockAsset: Partial<ImmichAsset> = {
    id: '7ce8bf0a-104f-452b-b5d5-ae16909ddf18',
    type: 'IMAGE',
    originalFileName: 'IRf75agxvL0.jpg',
    visibility: 'visible',
  };

  beforeEach(() => {
    environmentServiceMock = {
      getValue: jest.fn().mockReturnValue(mockBaseUrl),
    } as unknown as jest.Mocked<EnvironmentService>;

    TestBed.configureTestingModule({
      providers: [
        ImmichService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: environmentServiceMock },
      ],
    });

    service = TestBed.inject(ImmichService);
    httpMock = TestBed.inject(HttpTestingController);

    // Global mock for Node environments lacking DOM elements natively
    global.URL.createObjectURL = jest
      .fn()
      .mockReturnValue('blob:http://localhost/mock-uuid');
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getRandomPhotos', () => {
    it('should POST targeted date parameters and return strongly typed assets array', (done) => {
      const targetDate = '2026-07-13';
      const count = 19;

      service.getRandomPhotos(targetDate, count).subscribe((assets) => {
        expect(assets).toHaveLength(1);
        expect(assets[0].id).toBe('7ce8bf0a-104f-452b-b5d5-ae16909ddf18');
        done();
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/search/random`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('x-api-key')).toBe(
        'kNTwUx5uYGpFXc9IofjEHoLpFIydom6KQz0ugaOHilI',
      );
      expect(req.request.body).toEqual({
        type: 'IMAGE',
        takenAfter: '2026-07-13T00:00:00.000Z',
        takenBefore: '2026-07-13T23:59:59.999Z',
        isVisible: true,
        size: count,
      });

      req.flush([mockAsset]);
    });
  });

  describe('#getThumbnailUrl', () => {
    it('should request binary media blobs and convert to localized object URLs strings', (done) => {
      const assetId = '1df6a748-7627-4882-b7c4-ba8edc6d98d4';
      const mockBlob = new Blob([''], { type: 'image/jpeg' });

      service.getThumbnailUrl(assetId).subscribe((url) => {
        expect(url).toBe('blob:http://localhost/mock-uuid');
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        done();
      });

      const req = httpMock.expectOne(
        `${mockBaseUrl}/assets/${assetId}/thumbnail?size=preview`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');

      req.flush(mockBlob);
    });
  });

  describe('#getUrl', () => {
    it('should query environment provider layer to append route fragments accurately', () => {
      const finalRoute = service.getUrl('/test-endpoint');
      expect(environmentServiceMock.getValue).toHaveBeenCalledWith('immichUrl');
      expect(finalRoute).toBe(`${mockBaseUrl}/test-endpoint`);
    });
  });
});
