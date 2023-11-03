import { isObservable } from 'rxjs';

export const defaultOnMessage =
  (logger) =>
  async ({ handler, data, ackOrNack }) => {
    try {
      const streamOrResult = await handler(data);
      if (isObservable(streamOrResult)) {
        streamOrResult.subscribe();
      }
      ackOrNack();
    } catch (err) {
      logger.error(err);
      ackOrNack(err, [
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
