import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { BrokerAsPromised as Broker } from 'rascal';
import { RascalService } from '../service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { OutboundMessageIdentitySerializer } from './serializer';
import { RascalClientOptions } from './';
import { DefaultConfigKey, defaultOnPublicationError } from './defaults';

export class RascalClient extends ClientProxy {
  private broker: Broker;
  private readonly rascalService: RascalService;
  private readonly configService: ConfigService;
  private readonly onPublicationError: (err: any, messageId: string) => void;
  private readonly configKey: string;
  private readonly logger = new Logger(RascalClient.name);

  constructor({
    rascalService,
    configService,
    serializer,
    onPublicationError,
    configKey,
  }: RascalClientOptions) {
    super();
    this.rascalService = rascalService;
    this.configService = configService;
    this.onPublicationError =
      onPublicationError ?? defaultOnPublicationError(this.logger);
    this.configKey = configKey ?? DefaultConfigKey;
    this.initializeSerializer({
      serializer: serializer ?? new OutboundMessageIdentitySerializer(),
    });
  }

  async connect(): Promise<any> {
    if (!this.broker) {
      this.broker = await this.rascalService.connect(
        this.configService.get(this.configKey),
      );
    }
    return this.broker;
  }

  async close() {
    await this.rascalService.shutdown();
  }

  private async publishEvent(packet: ReadPacket): Promise<any> {
    try {
      const { pattern, data } = this.serializer.serialize(packet);
      const publication = await this.rascalService.publish(pattern, data);
      publication.on('error', this.onPublicationError);
      return publication;
    } catch (err) {
      throw new Error(`Rascal config error: ${err.message}`);
    }
  }

  async dispatchEvent(packet: ReadPacket): Promise<any> {
    this.logger.verbose(`Dispatching event {${packet.pattern}}`);
    return await this.publishEvent(packet);
  }

  publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    this.logger.verbose(`Dispatching event {${packet.pattern}}`);
    this.publishEvent(packet)
      .then(callback)
      .catch((err) => callback({ err }));
    return () => undefined;
  }
}
