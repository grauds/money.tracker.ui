import { EnvironmentInterface } from '@clematis-shared/shared-components';
// mac -> remote mt
export const environment: EnvironmentInterface = {
  production: false,
  apiUrl: 'http://192.168.1.118:18085/api',
  infoUrl: 'http://192.168.1.118:18085',
  authUrl: 'https://192.168.1.157/',
  authClientId: 'clematis-money-tracker-ui',
  storageUrl: 'http://192.168.1.118:18085/api/storage/mt',
  weatherUrl: 'http://192.168.1.118:18087',
  immichUrl: '/immich',
};
