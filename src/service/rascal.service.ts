import { BrokerAsPromised as Broker } from 'rascal';
import { Logger } from '@nestjs/common';
import {
  defaultBrokerSetUp,
  defaultOnConnectionError,
  BrokerSetUpFn,
  RascalServiceOptions,
  OnConnectionErrorFn,
} from './options';

export class RascalService {
  broker: Broker | null = null;
  private readonly logger = new Logger(RascalService.name);
  private readonly brokerSetUp: BrokerSetUpFn;
  private readonly onConnectionError: OnConnectionErrorFn;

  constructor({ brokerSetUp, onConnectionError }: RascalServiceOptions = {}) {
    this.brokerSetUp = brokerSetUp ?? defaultBrokerSetUp;
    this.onConnectionError = onConnectionError ?? defaultOnConnectionError;
  }

  async connect(config: any = {}): Promise<Broker> {
    this.broker = await Broker.create(config);
    this.broker.on('error', async (err: any) => this.onConnectionError({ logger: this.logger, err }));
    await this.brokerSetUp({ logger: this.logger, broker: this.broker });
    this.logger.log(`Rascal broker stablished`);
    return this.broker;
  }

  checkBrokerInitialized() {
    if (!this.broker) {
      throw new Error('Rascal broker not initialized');
    }
  }

  async shutdown() {
    this.checkBrokerInitialized();
    await this.broker?.shutdown();
    this.logger.log(`Rascal broker shutdown`);
  }

  async publish(event: string, message: any) {
    this.checkBrokerInitialized();
    this.logger.verbose(`Publishing message to {${event}}`);
    return await this.broker?.publish(event, message);
  }

  async subscribe(event: string) {
    this.checkBrokerInitialized();
    this.logger.verbose(`Subscribing to {${event}}`);
    return this.broker?.subscribe(event);
  }
}
