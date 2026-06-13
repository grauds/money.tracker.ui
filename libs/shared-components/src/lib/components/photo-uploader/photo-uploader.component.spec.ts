import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
// --- POLYFILL JSDOM MISSING METHOD BEFORE IMPORTS RESOLVE ---
if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}
import { ImageCropperComponent, ImageCroppedEvent } from "ngx-image-cropper";
import { of, throwError } from "rxjs";
import { PhotoUploaderComponent } from "./photo-uploader.component";
import { StorageService } from "../../service/storage.service";

// Mock class implementation to isolate the network layer without Jasmine utilities
class MockStorageService {
  // Local variable pointer allows our test blocks to mock specific server responses dynamically
  responseStream$ = of({ url: "https://mock-cdn.local" });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  upload(_blob: Blob, _name: string) {
    return this.responseStream$;
  }

  delete() {
    return this.responseStream$
  }
}

describe("PhotoUploaderComponent", () => {
  let component: PhotoUploaderComponent;
  let fixture: ComponentFixture<PhotoUploaderComponent>;
  let mockStorageService: MockStorageService;

  beforeEach(async () => {
    mockStorageService = new MockStorageService();

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        CommonModule,
        ImageCropperComponent,
        PhotoUploaderComponent
      ],
      providers: [
        { provide: StorageService, useValue: mockStorageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default states", () => {
    expect(component.isCroppingMode).toBeFalsy();
    expect(component.croppedBlob).toBeNull();
  });

  it("should enter cropping mode when a file is selected", () => {
    const mockFile = new File([""], "avatar.jpg", { type: "image/jpeg" });
    const mockEvent = {
      target: { files: [mockFile] }
    } as unknown as Event;

    component.onFileChange(mockEvent);

    expect(component.isCroppingMode).toBeTruthy();
  });

  it("should save cropped blob data on image crop event", () => {
    const mockBlob = new Blob([""], { type: "image/jpeg" });
    const mockCroppedEvent = {
      blob: mockBlob,
      objectUrl: "blob:http://localhost/preview"
    } as ImageCroppedEvent;

    component.onImageCropped(mockCroppedEvent);

    expect(component.croppedBlob).toBeTruthy();
    expect(component.croppedPreviewUrl).toBe("blob:http://localhost/preview");
  });

  it("should reset state on cancel", () => {
    component.isCroppingMode = true;

    component.cancelEditing();

    expect(component.isCroppingMode).toBeFalsy();
  });

  it("should handle service stream exceptions cleanly without updating local display bindings", () => {
    component.croppedBlob = new Blob(
      ["failed-data"],
      { type: "image/jpeg" }
    );
    component.isCroppingMode = true;

    // Mock Jest console tracking to ensure test outputs remain completely silent
    const errorSpy = jest.spyOn(console, "error")
      .mockImplementation(() => { /* empty */
      });

    // Inject a throwing observable stream directly into the fake service layer instance
    mockStorageService.responseStream$ = throwError(
      () => new Error("Simulated HTTP Failure")
    );

    component.onUpload();

    expect(component.isCroppingMode).toBeTruthy();
    expect(errorSpy).toHaveBeenCalled();

    // Restore console window context changes
    errorSpy.mockRestore();
  });

  it('should update the scale factor object configuration when the zoom handle slides', () => {
    const mockEvent = {
      target: { value: '2.5' }
    } as unknown as Event;

    component.onZoomChange(mockEvent);

    expect(component.scaleValue).toBe(2.5);
    expect(component.transform).toEqual({
      scale: 2.5,
      translateH: 0,
      translateV: 0 });
  });

  it('should restore default placeholder image ' +
    'and trigger event when image is deleted', () => {

    component.entityName = 'products';
    component.entityId = '123';
    component.isCroppingMode = true;

    jest.spyOn(mockStorageService, 'delete')
      .mockReturnValue(of({ url: 'some-url' }));

    const deleteSpy
      = jest.spyOn(component.imageDeleted, 'emit');

    component.onDelete();

    expect(component.isCroppingMode).toBeFalsy();
    expect(deleteSpy).toHaveBeenCalled();
    expect((component as any).imageTrigger()).toBe('RESET');
  });
});
