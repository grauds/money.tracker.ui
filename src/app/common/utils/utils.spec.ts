import { Utils } from './utils';
import { token, url } from './utils.data';

describe('Utils', () => {
  it('should create an instance', () => {
    expect(new Utils()).toBeTruthy();
  });

  it('should parse a token', () => {
    const user = Utils.parseJwt(token)
    console.log(user)
    expect(user.email).toEqual('antroshin@wileyqa.com')
    expect(user.userid).toEqual('antroshin')
  });

  it('should parse an url', () => {
    const parsed = Utils.parseResourceUrlToAppUrl(url)
    console.log(parsed)
    expect(parsed).toEqual('/expenseItems/102')
  });
});
