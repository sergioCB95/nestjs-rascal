import { ConfigService } from '@nestjs/config';
import { RascalService } from '../service';
import { Serializer } from '@nestjs/microservices';

export type RascalClientOptions = {
  readonly rascalService: RascalService;
  readonly configService: ConfigService;
  readonly serializer?: Serializer;
  onPublicationError?: (err: any, messageId: string) => void;
  configKey?: string;
};
