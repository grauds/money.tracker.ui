import { EnvironmentInterface } from '@clematis-shared/shared-components';
// mac -> remote mt-demo
export const environment: EnvironmentInterface = {
  production: false,
  apiUrl: 'http://192.168.1.118:18086/api',
  infoUrl: 'http://192.168.1.118:18086',
  authUrl: 'https://192.168.1.157/',
  authClientId: 'clematis-money-tracker-ui-demo',
  storageUrl: 'http://192.168.1.118:18086/api/storage/mt-demo',
  weatherUrl: 'https://192.168.1.118:18443/weather-api',
  immichUrl: 'https://192.168.1.118:18443/immich',
  wordpressUrl: 'https://192.168.1.118:18443/wordpress',
};
