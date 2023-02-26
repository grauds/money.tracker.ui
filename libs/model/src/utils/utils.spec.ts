import { Utils } from './utils';
import { token, url, url2, url3 } from './utils.data';

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

  it('should parse an url', () => {
    const parsed = Utils.parseResourceUrlToAppUrl(url2)
    console.log(parsed)
    expect(parsed).toEqual('/expenseItems/47/tradeplace')
  });

  it('should parse an url', () => {
    const parsed = Utils.parseResourceUrlToAppUrl(url3)
    console.log(parsed)
    expect(parsed).toEqual('/commodities/52/http:/192.168.1.2:18085/commodityGroups/1')
  });

});
