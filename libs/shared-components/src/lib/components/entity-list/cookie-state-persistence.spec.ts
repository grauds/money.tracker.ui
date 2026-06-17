import { Router } from '@angular/router';
import { ComponentState, CookieStatePersistence } from "./cookie-state-persistence";
import { CookieService } from "../../service/cookie.service";

describe('CookieStatePersistence', () => {
  let mockRouter: Partial<Router>;
  let mockCookieService: jest.Mocked<CookieService>;

  beforeEach(() => {
    mockRouter = {
      url: '/admin/users?page=2'
    };

    mockCookieService = {
      setState: jest.fn(),
      getState: jest.fn()
    } as unknown as jest.Mocked<CookieService>;
  });

  it('should generate a sanitized route-isolated cookie key', () => {
    const persistence = new CookieStatePersistence(
      mockRouter as Router,
      mockCookieService as CookieService,
      'test_key'
    );
    expect(persistence.getRouteIsolatedCookieKey()).toBe('test_key__admin_users');
  });

  it('should save and correctly restore state from cookies', () => {
    const persistence = new CookieStatePersistence(
      mockRouter as Router,
      mockCookieService as CookieService,
      'test_key'
    );
    const mockFilter = new Map<string, string>([['role', 'admin']]);
    const expectedState: ComponentState = {
      n: 2,
      limit: 25,
      sort: { name: 'ASC' as any },
      filter: [['role', 'admin']]
    };

    jest.mocked(mockCookieService.getState).mockReturnValue(expectedState);

    persistence.saveState(2, 25, { name: 'ASC' as any }, mockFilter);
    expect(mockCookieService.setState).toHaveBeenCalledWith(
      'test_key__admin_users',
      expectedState
    );

    const loaded = persistence.loadState();
    expect(loaded).toBeTruthy();
    expect(loaded?.n).toBe(2);
    expect(loaded?.limit).toBe(25);
    expect(loaded?.sort).toEqual({ name: 'ASC' });
    expect(loaded?.filter).toEqual([['role', 'admin']]);
  });
});
