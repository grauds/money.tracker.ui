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
    const resourceAddress = new URL(url);
    return resourceAddress.pathname.replace('/api', '');
  }
}
