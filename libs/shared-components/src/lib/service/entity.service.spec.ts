import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from "rxjs";
import { EntityService } from './entity.service';
import { HateoasResourceService, PagedResourceCollection, ResourceCollection } from "@lagoshny/ngx-hateoas-client";
import { EntityGroup } from "@clematis-shared/model";

// 1. Extend your actual entity model type
class MockEntity extends EntityGroup {
  id = '123';
  override name = 'Test Entity';
  override getSelfLinkHref = () => 'http://localhost/self';
}

describe('EntityGroupsService', () => {
  // Cast service as 'any' or loosen type constraints if structural matching errors occur
  let service: EntityService<any, any>;
  let mockHttp: jest.Mocked<HttpClient>;
  let mockHateoasService: jest.Mocked<HateoasResourceService>;
  let mockEnvironmentService: any;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn()
    } as any;

    mockHateoasService = {
      searchPage: jest.fn(),
      getPage: jest.fn(),
      searchCollection: jest.fn()
    } as any;

    mockEnvironmentService = {
      getUrl: jest.fn((path: string) => `http://example.com${path}`)
    };

    // Instantiate with generic target type bound to MockEntity
    service = new EntityService<MockEntity, MockEntity>(
      mockHttp,
      mockHateoasService,
      mockEnvironmentService,
      MockEntity as any,
      MockEntity as any
    );

    // FIX: Safely mock the method on the class prototype if spyOn complains
    (service as any).getUrl = jest.fn((path: string) => `http://example.com${path}`);
  });

  describe('searchPage', () => {
    it('should forward search configuration parameters to hateoasService', (done) => {
      const options = { pageParams: { page: 0, size: 10 } } as any;
      const queryName = 'findByName';

      // FIX: Cast empty object as PagedResourceCollection to avoid constructor errors
      const mockResult = {} as PagedResourceCollection<any>;

      mockHateoasService.searchPage.mockReturnValue(of(mockResult));

      service.searchPage(options, queryName).subscribe((result) => {
        expect(mockHateoasService.searchPage).toHaveBeenCalledWith(
          MockEntity,
          queryName,
          options
        );
        expect(result).toBe(mockResult);
        done();
      });
    });
  });

  describe('getPage', () => {
    it('should query hateoasService with the specified runtime resource type constructor', (done) => {
      const options = { pageParams: { page: 2, size: 20 } } as any;
      const mockResult = {} as PagedResourceCollection<any>;

      mockHateoasService.getPage.mockReturnValue(of(mockResult));

      service.getPage(options).subscribe((result) => {
        expect(mockHateoasService.getPage).toHaveBeenCalledWith(MockEntity, options);
        expect(result).toBe(mockResult);
        done();
      });
    });
  });

  describe('getPath', () => {
    // Use async/await instead of the tricky done() callback
    it('should fetch collection elements when a valid id string is supplied', async () => {
      const id = 'entity-456';

      const mockResult = {
        resources: []
      } as unknown as ResourceCollection<any>;

      mockHateoasService.searchCollection.mockReturnValue(of(mockResult));

      // Convert the RxJS stream directly into a resolved promise value
      const result = await firstValueFrom(service.getPath(id));

      // Perform your assertions safely outside the async observer scope
      expect(mockHateoasService.searchCollection).toHaveBeenCalledWith(
        MockEntity,
        'pathById',
        {
          params: {
            id: id,
          },
        }
      );

      expect(result).toBe(mockResult);
    });
  });

  describe('getTotals', () => {
    it('should hit the correct endpoint tracking expense details for the resource', (done) => {
      const id = 'group-789';
      const moneyCode = 'EUR' as any;
      const mockTotalValue = 1250.75;

      mockHttp.get.mockReturnValue(of(mockTotalValue));

      service.getExpensesSum(id, moneyCode).subscribe((total) => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          'http://example.com/expenseItems/search/sumMockEntityExpenses',
          {
            params: {
              id: id,
              moneyCode: moneyCode,
            },
          },
        );
        expect(total).toBe(mockTotalValue);
        done();
      });
    });

    it('should bypass the network entirely and return 0 if the tracking id reference drops to empty string', (done) => {
      service.getExpensesSum('', 'USD' as any).subscribe((total) => {
        expect(mockHttp.get).not.toHaveBeenCalled();
        expect(total).toBe(0);
        done();
      });
    });
  });
});
