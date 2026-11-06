import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityThumbnailComponent } from './entity-thumbnail.component';
import { Entity } from '@clematis-shared/model';
import { StorageService } from '../../../service/storage.service';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EntityThumbnailComponent', () => {
  let component: EntityThumbnailComponent<any>;
  let fixture: ComponentFixture<EntityThumbnailComponent<any>>;
  let storageServiceMock: jest.Mocked<StorageService>;

  // Create a proper Entity mock with getSelfLinkHref method
  const createMockEntity = (id: string, name: string): Entity => {
    const entity = new Entity();
    entity.name = name;
    // Mock the getSelfLinkHref method from Resource base class
    // Must be an absolute URL for new URL() to work in Utils.parseResourceUrlToAppUrl
    entity.getSelfLinkHref = jest.fn().mockReturnValue(`http://localhost:4200/api/entities/${id}`);
    return entity;
  };

  beforeEach(async () => {
    storageServiceMock = {
      getURL: jest.fn().mockReturnValue('http://storage.example.com/entities/123/main'),
      upload: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;

    await TestBed.configureTestingModule({
      imports: [EntityThumbnailComponent],
      providers: [
        { provide: StorageService, useValue: storageServiceMock },
        { provide: ActivatedRoute, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityThumbnailComponent);
    component = fixture.componentInstance;
    // Set entity before detectChanges to avoid template errors
    component.entity = createMockEntity('123', 'Test Entity');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isImageLoading).toBe(true);
    expect(component.currentLayout).toBe('grid');
    expect(component.entityLink).toBe('/entities/123');
    expect(component.id).toBe('123');
  });

  describe('#entity setter', () => {
    it('should set entityLink from entity self link', () => {
      expect(component.entityLink).toBe('/entities/123');
    });

    it('should set id from entity', () => {
      expect(component.id).toBe('123');
    });

    it('should reset isImageLoading to true when entity changes', () => {
      component.isImageLoading = false;

      const newEntity = createMockEntity('456', 'New Entity');
      component.entity = newEntity;

      expect(component.isImageLoading).toBe(true);
      expect(component.id).toBe('456');
      expect(component.entityLink).toBe('/entities/456');
    });

    it('should update id when entity changes', () => {
      const newEntity = createMockEntity('789', 'Another Entity');
      component.entity = newEntity;

      expect(component.id).toBe('789');
      expect(component.entityLink).toBe('/entities/789');
    });
  });

  describe('#getImageUrl', () => {
    it('should return storage URL when entity has name and entityName is set', () => {
      component.entityName = 'entities';

      const url = component.getImageUrl();

      expect(storageServiceMock.getURL).toHaveBeenCalledWith(
        'entities',
        '123',
        'main'
      );
      expect(url).toBe('http://storage.example.com/entities/123/main');
    });

    it('should return placeholder when entity name is missing', () => {
      const emptyEntity = createMockEntity('123', '');
      component.entity = emptyEntity;
      component.entityName = 'entities';

      const url = component.getImageUrl();

      expect(url).toBe('assets/product-placeholder.png');
    });

    it('should return placeholder when entityName is undefined', () => {
      component.entityName = undefined;

      const url = component.getImageUrl();

      expect(url).toBe('assets/product-placeholder.png');
    });

    it('should return placeholder when id is empty', () => {
      (component as any).id = '';
      component.entityName = 'entities';

      const url = component.getImageUrl();

      expect(url).toBe('assets/product-placeholder.png');
    });
  });

  describe('#onImageLoad', () => {
    it('should set isImageLoading to false', () => {
      component.isImageLoading = true;
      component.onImageLoad();

      expect(component.isImageLoading).toBe(false);
    });
  });
});
