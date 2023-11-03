import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { RascalService } from '../service';
import { InboundMessageIdentityDeserializer } from './deserializer';
import { defaultOnMessage, defaultOnSubscriptionError } from './defaults';
import { OnMessageConfig, RascalServerOptions } from '.';

export class RascalServer extends Server implements CustomTransportStrategy {
  private readonly config: any;
  private readonly rascalService: RascalService;
  private readonly onMessage: (config: OnMessageConfig) => Promise<void>;
  private readonly onSubscriptionError: (err: any) => Promise<void>;

  constructor({
    rascalService,
    config = {},
    deserializer,
    onMessage,
    onSubscriptionError,
  }: RascalServerOptions) {
    super();
    this.config = config;
    this.rascalService = rascalService;
    this.onMessage = onMessage ?? defaultOnMessage(this.logger);
    this.onSubscriptionError =
      onSubscriptionError ?? defaultOnSubscriptionError(this.logger);
    this.initializeDeserializer({
      deserializer: deserializer ?? new InboundMessageIdentityDeserializer(),
    });
  }

  async listen(callback: () => void) {
    await this.rascalService.connect(this.config);
    for await (const [pattern, handler] of this.messageHandlers.entries()) {
      const subscription = await this.rascalService.subscribe(pattern);
      subscription
        .on('message', async (message, content, ackOrNack) => {
          const { data } = await this.deserializer.deserialize(message, {
            pattern,
          });
          this.onMessage({
            handler,
            data,
            content,
            ackOrNack,
          });
        })
        .on('error', this.onSubscriptionError);
      this.logger.log(`Mapped {${pattern}} subscription`);
    }
    callback();
  }

  async close() {
    await this.rascalService.shutdown();
  }
}
