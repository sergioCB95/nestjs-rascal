import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { RascalService } from '../service';
import { InboundMessageIdentityDeserializer } from './deserializer';
import {
  OnMessageFn,
  RascalServerOptions,
  defaultOnMessage,
  defaultOnSubscriptionError,
  onSubscriptionErrorFn,
} from './options';
import { AckOrNack } from 'rascal';

export class RascalServer extends Server implements CustomTransportStrategy {
  private readonly config: any;
  private readonly rascalService: RascalService;
  private readonly onMessage: OnMessageFn;
  private readonly onSubscriptionError: onSubscriptionErrorFn;

  constructor({ rascalService, config = {}, deserializer, onMessage, onSubscriptionError }: RascalServerOptions) {
    super();
    this.config = config;
    this.rascalService = rascalService;
    this.onMessage = onMessage ?? defaultOnMessage;
    this.onSubscriptionError = onSubscriptionError ?? defaultOnSubscriptionError;
    this.initializeDeserializer({
      deserializer: deserializer ?? new InboundMessageIdentityDeserializer(),
    });
  }

  async listen(callback: () => void) {
    await this.rascalService.connect(this.config);
    for await (const [pattern, handler] of this.messageHandlers.entries()) {
      const subscription = await this.rascalService.subscribe(pattern);
      if (!subscription) {
        throw new Error(`Rascal subscription not found for {${pattern}}`);
      }
      subscription
        .on('message', async (message, content: any, ackOrNack: AckOrNack) => {
          const { data } = await this.deserializer.deserialize(message, {
            pattern,
          });
          await this.onMessage({
            handler,
            data,
            content,
            ackOrNack,
            logger: this.logger,
          });
        })
        .on('error', (err: any) => this.onSubscriptionError({ logger: this.logger, err }));
      this.logger.log(`Mapped {${pattern}} subscription`);
    }
    callback();
  }

  async close() {
    await this.rascalService.shutdown();
  }
}
