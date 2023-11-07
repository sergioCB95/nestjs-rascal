import { LoggerService } from '@nestjs/common';
import { AckOrNack } from 'rascal';

export type OnMessageConfig = {
  handler: (data: any) => Promise<any>;
  data: any;
  content: any;
  ackOrNack: AckOrNack;
  logger: LoggerService;
};

export type OnMessageFn = (config: OnMessageConfig) => Promise<void>;
