import { environment } from '../../../environments/environment';

export class Utils {

  static parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    if (base64Url !== null) {
      const base64 = base64Url
        .replace('-', '+')
        .replace('_', '/');
      return JSON.parse(atob(base64));
    } else {
      return token;
    }
  }

  static parseResourceUrlToAppUrl(url: string) {
    return url.replace(environment.apiUrl, '');
  }
}
