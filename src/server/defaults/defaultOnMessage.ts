import { isObservable } from 'rxjs';
import { LoggerService } from '@nestjs/common';
import { OnMessageConfig } from '../onMessageConfig';

export const defaultOnMessage =
  (logger: LoggerService) =>
  async ({ handler, data, ackOrNack }: OnMessageConfig) => {
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
  };
