import { Logger } from '@nestjs/common';
import { Serializer } from '@nestjs/microservices';

export class OutboundMessageIdentitySerializer implements Serializer {
  private readonly logger = new Logger(OutboundMessageIdentitySerializer.name);
  serialize(value: any) {
    this.logger.verbose(
      `-->> Serializing outbound message: \n${JSON.stringify(value)}`,
    );
    return value;
  }
}
