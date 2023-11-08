# nestjs-rascal
NestJS module to use Rascal library as RabbitMQ transporter

## Table of Content
- [Motivation](#motivation)
- [Rascal](#rascal)
- [How to User](#how-to-use)
    - [RascalService](#rascalservice)
        - [Connection and Rascal Configuration](#connection-and-rascal-configuraiton)
        - [Parameters](#parameters)
    - [RascalServer (Subscriber)](#rascalserver-subscriber)
        - [Parameters](#parameters-1)
    - [RascalClient (Publisher)](#rascalclient-publisher)


## Motivation 
The idea of this module is to be able to create RabbitMQ transporters in NestJS using all the goodness that NestJS provides, but having absolute control of the configuration and communication with RabbitMQ using the fabulous [rascal](https://github.com/onebeyond/rascal) module.

The motivation for making this module is to offer an alternative to create services that communicate with RabbitMQ without having to follow the strict form of communication established by the NestJS transporters (and in particular RabbitMQ):
- Request-response message style.
- Fixed message format.
- No control over resources created/used in the message broker (exchanges, queues, etc).

However, NestJS offers a number of important advantages when using its transporters, such as:
- Connection management during the life cycles of the application.
- Use of Controller and the boilerplate they provide (decorators, middlewares, etc).
- Use of the ClientProxy class for message publishing.

Therefore, this module allows you to continue enjoying these advantages while maintaining full control over the integration with RabbitMQ.

More info about NestJS microservices and transporters in [NestJS Microservices in Action](https://dev.to/johnbiundo/series/4724) and [Advance NestJs Microservices](https://dev.to/nestjs/part-1-introduction-and-setup-1a2l)

## Rascal

[rascal](https://github.com/onebeyond/rascal) is a fantastic library implemented on top of [amqplib](https://github.com/amqp-node/amqplib) to communicate with RabbitMQ that wraps and extends its functionality, creating the abstractions "publications" and "subscriptions", which allow abstracting the code from RabbitMQ's own concepts.

We encourage you to read the [rascal](https://github.com/onebeyond/rascal) documentation to learn how to configure this module.

## How to Use

### RascalService

It is the core service of this module and the one that manages the connection to RabbitMQ through Rascal. Depending on the needs of the service (publish or subscribe to messages) RascalService will be initialized in different ways (see [RascalServer](#rascalserver-subscriber) and [RascalClient](#rascalclient-publisher)). However, its initialization is as simple as:

```javascript
import { RascalService } from 'nestjs-rascal';

const rascalService = new RascalService();
```

#### Connection and Rascal Configuraiton
RascalService implements the `connect` method to connect to RabbitMQ, for this, it expects to receive as argument a configuration compatible with the [rascal Broker configuration](
https://github.com/onebeyond/rascal#configuration). However, in practice, this method will be called internally by the other components that use RascalService.

```javascript
import { RascalService } from 'nestjs-rascal';

const rascalService = new RascalService()
await rascalService.connect({
  "vhosts": {
    "v1": {
      "exchanges": {
        "e1": {}
      },
      "queues": {
        "q1": {}
      },
      "bindings": {
        "b1": {
          "source": "e1",
          "destination": "q1",
          "destinationType": "queue",
          "bindingKey": "foo"
        }
      }
    }
  }
});
```

#### Parameters

RascalService implements a number of optional configuration parameters to customise its operation. All of them already have a basic default value ([here](./src/service/options/defaults/)), in case they do not need to be configured:
- `brokerSetUp`: function that runs right after connecting to RabbitMQ and instantiating the rascal Broker. It allows you to make any kind of configuration settings over this.
- `onConnectionError`: function to be executed if a problem occurs during connection establishment.

```javascript
import { RascalService } from 'nestjs-rascal';

const rascalService = new RascalService({
    brokerSetUp: async ({ logger, broker }) => 
        logger.debug('Running default broker setup');
    onConnectionError: async ({ logger, err }) => 
        logger.error('Rascal connection error', err);
});
```

### RascalServer (Subscriber)

RascalServer allows you to create NestJS microservices that consume messages from RabbitMQ queues. The initialization of customer transporters like rascalServer is explained in the official NestJS documentation [here](https://docs.nestjs.com/microservices/custom-transport#message-serialization).

```javascript
async function bootstrap() {
  const app = await NestFactory.create<MicroserviceOptions>(AppModule, {
    strategy: new RascalServer({
      rascalService: new RascalService(),
      config,
    }),
  });
  await app.listen();
}
bootstrap();
```

#### Parameters

RascalServer has two mandatory parameters:
- `rascalService`: RascalService instance to be used internally to communicate with RabbitMQ (via Rascal)
- `config`: Rascal configuration used to connect and configure what RabbitMQ resources to use.

Apart from these, it also has a number of optional parameters with default values (functions [here](./src/server/options/defaults/) and deserializer [here](./src/server/deserializer/)) that allow further configuration:
- `deserializer`: Deserializer class used to deserialize messages received by subscriptions.
- `onMessage`: Function used to manage messages received from subscriptions and delegate them to the corresponding handler. 
- `onSubscriptionError`: Function to handle errors during the establishment of subscriptions.


```javascript
const onMessage = async ({ handler, data, content, ackOrNack, logger }) => {
  try {
    const streamOrResult = await handler(data);
    if (isObservable(streamOrResult)) {
      streamOrResult.subscribe();
    }
    ackOrNack();
  } catch (err) {
    logger.error(err);
    ackOrNack(err as Error, [
      {
        strategy: 'republish',
        defer: 1000,
        attempts: 10,
      },
      {
        strategy: 'nack',
      },
    ]);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<MicroserviceOptions>(AppModule, {
    strategy: new RascalServer({
      rascalService: new RascalService(),
      config,
      onMessage,
      onSubscriptionError: async ({ err, logger }) => logger.error(err);
      deserializer: new InboundMessageIdentityDeserializer(),
    }),
  });
  await app.listen();
}
bootstrap();
```

### RascalClient (Publisher)

RascalClient allows to publish messages to RabbitMQ from a NestJS application. To do this it uses the [ClientProxy](https://docs.nestjs.com/microservices/custom-transport#client-proxy) class that implements NestJS. It can be initialized in different ways, the simplest is the following:

```javascript
const config = {
    rascal: {
        /*...*/
    }
}

@Module({
  imports: [ConfigModule.forRoot({ load: [config] })],
  controllers: [],
  providers: [
    {
      provide: RascalService,
      useFactory: () => {
        return new RascalService();
      },
    },
    {
      provide: RascalClient,
      useFactory: (
        rascalService: RascalService,
        configService: ConfigService,
      ) => {
        return new RascalClient({ rascalService, configService });
      },
      inject: [RascalService, ConfigService],
    },
  ],
  exports: [],
})
export class AppModule {}
```

First, you will need to create the `RascalService` component, which will be injected into the RascalClient component. Then, you can create the RascalClient component as explained in the snippet. The RascalClient component also expects the ConfigService component (more info [here](https://docs.nestjs.com/techniques/configuration)) to be initialized and to contain the Rascal configuration under the `rascal` key (it can be configured to use another key).

### Parameters

RascalClient expects to receive 2 mandatory parameters:

- `rascalService`: RascalService instance that will be used internally to communicate with RabbitMQ (through rascal).
- `configService`: ConfigService instance (more info here) used to inject rascal configuration. By default, this configuration should be under the `rascal` key.

Apart from these, it also contains a number of optional parameters (dafault values for functions [here](./src/client/options/defaults/) and serializer [here](./src/client/serializer/)):

- `serializer`: Serializer class used to serialize messages received by publications.
- `onPublicationError`: Function to handle errors during the attempt to publish a message.
- `configKey`: Key containing the Rascal configuration in the ConfigService (`rascal` by default).

```javascript
const config = {
    otherKey: {
        /*...*/
    }
}

@Module({
  imports: [ConfigModule.forRoot({ load: [config] })],
  controllers: [],
  providers: [
    {
      provide: RascalService,
      useFactory: () => {
        return new RascalService();
      },
    },
    {
      provide: RascalClient,
      useFactory: (
        rascalService: RascalService,
        configService: ConfigService,
      ) => {
        return new RascalClient({ 
            rascalService, 
            configService,
            serializer: new OutboundMessageIdentitySerializer(),
            onPublicationError: async ({ logger, err, messageId }) =>
                logger.error('Publisher error', err, messageId);
            configKey: 'otherKey',
            });
      },
      inject: [RascalService, ConfigService],
    },
  ],
  exports: [],
})
export class AppModule {}
```