import { InjectionToken } from '@nestjs/common';

export type UnwrapForRootArgs<A extends any[]> = {
  [P in keyof A]: InjectionToken<A[P]>
};
