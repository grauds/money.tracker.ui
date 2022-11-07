import { Resource } from '@lagoshny/ngx-hateoas-client';

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

  static getIdFromSelfUrl(entity: Resource) {
    const resourceAddress = new URL(entity.getSelfLinkHref());
    return resourceAddress.pathname.substring(resourceAddress.pathname.lastIndexOf('/') + 1,
      resourceAddress.pathname.length);
  }

  static getFormattedStringFromDays(numberOfDays: number): string {
    const years = Math.floor(numberOfDays / 365);
    const months = Math.floor(numberOfDays % 365 / 30);
    const days = Math.floor(numberOfDays % 365 % 30);

    const yearsDisplay = years > 0 ? years + (years == 1 ? " year, " : " years, ") : "";
    const monthsDisplay = months > 0 ? months + (months == 1 ? " month, " : " months, ") : "";
    const daysDisplay = days > 0 ? days + (days == 1 ? " day" : " days") : "";
    return yearsDisplay + monthsDisplay + daysDisplay;
  }
}
