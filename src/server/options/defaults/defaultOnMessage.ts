import { isObservable } from 'rxjs';
import { OnMessageFn } from '../onMessage';

export const defaultOnMessage: OnMessageFn = async ({ handler, data, ackOrNack, logger }) => {
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
