import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoGalleryComponent } from './photo-gallery.component';
import { ImmichAsset, ImmichService } from '@clematis-shared/shared-components';
import { of, throwError } from 'rxjs';
import { ComponentRef } from '@angular/core';

describe('PhotoGalleryComponent', () => {
  let component: PhotoGalleryComponent;
  let fixture: ComponentFixture<PhotoGalleryComponent>;
  let componentRef: ComponentRef<PhotoGalleryComponent>;
  let mockImmichService: jest.Mocked<ImmichService>;

  const mockAssets: Partial<ImmichAsset>[] = [
    { id: 'asset-1', type: 'IMAGE' },
    { id: 'asset-2', type: 'IMAGE' },
  ];

  beforeEach(async () => {
    mockImmichService = {
      getRandomPhotos: jest.fn(),
      getThumbnailUrl: jest.fn(),
    } as unknown as jest.Mocked<ImmichService>;

    await TestBed.configureTestingModule({
      imports: [PhotoGalleryComponent],
      providers: [{ provide: ImmichService, useValue: mockImmichService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoGalleryComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set mandatory signal-based inputs required by the layout
    componentRef.setInput('date', '2026-07-13');
    componentRef.setInput('qty', 2);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load photos successfully', () => {
    mockImmichService.getRandomPhotos.mockReturnValue(
      of(mockAssets as ImmichAsset[]),
    );
    mockImmichService.getThumbnailUrl.mockReturnValue(of('blob:mock-url'));
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });


  it('should fetch assets and render the infinite ribbon groups upon successful stream loads', () => {
    mockImmichService.getRandomPhotos.mockReturnValue(
      of(mockAssets as ImmichAsset[]),
    );
    mockImmichService.getThumbnailUrl.mockImplementation((id: string) =>
      of(`blob:mock-url/${id}`),
    );

    // Trigger lifecycle hooks (ngOnInit)
    fixture.detectChanges();

    expect(mockImmichService.getRandomPhotos).toHaveBeenCalledWith(
      '2026-07-13',
      2,
    );
    expect(mockImmichService.getThumbnailUrl).toHaveBeenCalledTimes(2);

    // Verify application signals resolve correctly
    expect(component.isLoading()).toBe(false);
    expect(component.imageUrls()).toEqual([
      'blob:mock-url/asset-1',
      'blob:mock-url/asset-2',
    ]);

    // Check template output structural elements
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loader')).toBeNull();
    expect(compiled.querySelector('.ribbon-container')).toBeTruthy();

    const displayedImages = compiled.querySelectorAll('.ribbon-group img');
    // 2 mock assets duplicated across 2 ribbon groups = 4 rendered elements total
    expect(displayedImages).toHaveLength(4);
    expect(displayedImages[0].getAttribute('src')).toBe(
      'blob:mock-url/asset-1',
    );
  });

  it('should graceful handle backend pipeline errors and terminate loading sequences', () => {
    mockImmichService.getRandomPhotos.mockReturnValue(
      throwError(() => new Error('API Error')),
    );

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(true);
    expect(component.imageUrls()).toEqual([]);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.ribbon-container')).toBeNull();
  });

  it('should gracefully handle sub-resource thumbnail failures during forkJoin forks', () => {
    mockImmichService.getRandomPhotos.mockReturnValue(
      of(mockAssets as ImmichAsset[]),
    );
    mockImmichService.getThumbnailUrl.mockReturnValue(
      throwError(() => new Error('Thumbnail missing')),
    );

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(true);
    expect(component.imageUrls()).toEqual([]);
  });
});
