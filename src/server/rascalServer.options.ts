import { Deserializer } from '@nestjs/microservices';
import { RascalService } from '../service';
import { OnMessageConfig } from '.';

export type RascalServerOptions = {
  rascalService: RascalService;
  config: any;
  deserializer?: Deserializer;
  onMessage?: (config: OnMessageConfig) => Promise<void>;
  onSubscriptionError?: (err: any) => Promise<void>;
};
