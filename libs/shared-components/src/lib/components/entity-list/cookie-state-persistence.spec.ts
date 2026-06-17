import { Router } from '@angular/router';
import { CookieStatePersistence } from './cookie-state-persistence';

describe('CookieStatePersistence', () => {
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    mockRouter = {
      url: '/admin/users?page=2'
    };

    // Clean up our mock cookie store before every test run
    // @ts-expect-error("")
    (document as never).cookie = '';
  });

  it('should generate a sanitized route-isolated cookie key', () => {
    const persistence = new CookieStatePersistence(mockRouter as Router, 'test_key');
    expect(persistence.getRouteIsolatedCookieKey()).toBe('test_key__admin_users');
  });

  it('should save and correctly restore state from cookies', () => {
    const persistence = new CookieStatePersistence(mockRouter as Router, 'test_key');
    const mockFilter = new Map<string, string>([['role', 'admin']]);

    // Safely simulate cookie string management inside JSDOM environment
    let cookieStore = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((val) => {
      cookieStore = val;
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieStore);

    persistence.saveState(2, 25, { name: 'ASC' as any }, mockFilter);

    const loaded = persistence.loadState();
    expect(loaded).toBeTruthy();
    expect(loaded?.n).toBe(2);
    expect(loaded?.limit).toBe(25);
    expect(loaded?.sort).toEqual({ name: 'ASC' });
    expect(loaded?.filter).toEqual([['role', 'admin']]);
  });
});
