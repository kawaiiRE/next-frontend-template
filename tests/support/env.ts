export const TEST_APP_ORIGIN = 'http://localhost:3000';

export function setTestEnvironment() {
  process.env.POCKETBASE_URL = 'http://127.0.0.1:8090';
  process.env.APP_ORIGIN = TEST_APP_ORIGIN;
  delete process.env.CLIENT_IP_HEADER;
}
