import { LoggerService } from '@nestjs/common';

export type OnConnectionErrorContext = {
  logger: LoggerService;
  err: any;
};

export type OnConnectionErrorFn = (context: OnConnectionErrorContext) => Promise<void>;
