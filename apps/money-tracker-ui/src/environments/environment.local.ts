import { EnvironmentInterface } from '@clematis-shared/shared-components';
// mac -> local mt
export const environment: EnvironmentInterface = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  infoUrl: 'http://localhost:8080',
  authUrl: 'http://192.168.1.157:8080/',
  authClientId: 'clematis-money-tracker-ui',
  storageUrl: 'http://localhost:8080/api/storage/mt',
  weatherUrl: 'http://192.168.1.118:18087',
  immichUrl: '/immich',
  wordpressUrl: '/wordpress',
};
