import { Inject, Provider } from '@nestjs/common';
import webPush from 'web-push';

const WEB_PUSH = 'WEB_PUSH';

export const WEB_PUSH_PROVIDER: Provider = {
  provide: WEB_PUSH,
  useValue: webPush
};

export const InjectWebPush = () => Inject(WEB_PUSH);
