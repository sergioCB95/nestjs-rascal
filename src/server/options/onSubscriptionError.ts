import { LoggerService } from '@nestjs/common';

export type onSubscriptionErrorContext = {
  err: any;
  logger: LoggerService;
};

export type onSubscriptionErrorFn = (context: onSubscriptionErrorContext) => Promise<void>;
