import { onSubscriptionErrorFn } from '../onSubscriptionError';

export const defaultOnSubscriptionError: onSubscriptionErrorFn = async ({ err, logger }) => logger.error(err);
