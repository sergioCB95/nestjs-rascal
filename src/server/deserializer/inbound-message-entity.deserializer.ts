import { ConsumerDeserializer, IncomingEvent } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export class InboundMessageIdentityDeserializer
  implements ConsumerDeserializer
{
  private readonly logger = new Logger(InboundMessageIdentityDeserializer.name);

  deserialize(value: any, options?: Record<string, any>): IncomingEvent {
    this.logger.verbose(
      `<<-- deserializing inbound message:\n${JSON.stringify(
        value,
      )}\n\twith options: ${JSON.stringify(options)}`,
    );
    return {
      pattern: options.pattern || '',
      data: JSON.parse(value.content.toString()),
    };
  }
}
