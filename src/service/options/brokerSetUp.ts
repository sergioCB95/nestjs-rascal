import { BrokerAsPromised as Broker } from 'rascal';
import { LoggerService } from '@nestjs/common';

export type BrokerSetUpContext = {
  logger: LoggerService;
  broker: Broker;
};

export type BrokerSetUpFn = (context: BrokerSetUpContext) => Promise<void>;
