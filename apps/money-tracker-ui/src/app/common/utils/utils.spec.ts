import { Utils } from './utils';
import {token, url, url2} from './utils.data';
import {Commodity} from "../model/commodity";

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

  it('should get an id', () => {
    const commodity = new Commodity()
  })

});
