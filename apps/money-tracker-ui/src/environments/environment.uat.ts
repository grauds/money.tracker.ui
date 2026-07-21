import { EnvironmentInterface } from '@clematis-shared/shared-components';
// remote mt
export const environment: EnvironmentInterface = {
  production: true,
  apiUrl: '/api',
  infoUrl: '/info',
  authUrl: 'https://192.168.1.157:443/',
  authClientId: 'clematis-money-tracker-ui',
  storageUrl: '/api/storage/mt',
  weatherUrl: '/weather-api',
  immichUrl: '/immich',
  wordpressUrl: '/wordpress',
};
