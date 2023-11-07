import { ConfigService } from '@nestjs/config';
import { RascalService } from '../../service';
import { Serializer } from '@nestjs/microservices';
import { onPublicationErrorFn } from './onPublicationError';

export type RascalClientOptions = {
  readonly rascalService: RascalService;
  readonly configService: ConfigService;
  readonly serializer?: Serializer;
  onPublicationError?: onPublicationErrorFn;
  configKey?: string;
};
