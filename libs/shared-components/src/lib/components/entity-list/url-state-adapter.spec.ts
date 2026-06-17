import { ActivatedRoute } from '@angular/router';
import { UrlStateAdapter } from './url-state-adapter';

describe('UrlStateAdapter', () => {
  it('should parse native Angular query strings accurately', () => {
    const query = { page: '3', size: '50', sort: 'email,desc', role: 'editor' };
    const result = UrlStateAdapter.parseParams(query);

    expect(result.n).toBe(3);
    expect(result.limit).toBe(50);
    expect(result.sort).toEqual({ email: 'desc' });
    expect(result.filter.get('role')).toBe('editor');
  });

  it('should compile component property metrics into clear NavigationExtras query params', () => {
    const mockRoute = {
      snapshot: {
        queryParamMap: { keys: [] }
      }
    } as unknown as ActivatedRoute;

    const filter = new Map<string, string>([['status', 'active']]);

    const extras = UrlStateAdapter.buildRouteParameters(
      1,
      10,
      { id: 'ASC' as never },
      filter,
      'merge',
      mockRoute
    );

    expect(extras.queryParams?.['page']).toBe(1);
    expect(extras.queryParams?.['sort']).toBe('id,ASC');
    expect(extras.queryParams?.['status']).toBe('active');
  });
});
