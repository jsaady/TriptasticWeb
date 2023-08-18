import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  vus: 10,
  duration: '30s',
};
export default function () {
  http.get('https://jteq-runner.apps.holyham.cloud');
  sleep(1);
}
