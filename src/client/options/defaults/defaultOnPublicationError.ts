import { onPublicationErrorFn } from '../onPublicationError';

export const defaultOnPublicationError: onPublicationErrorFn = async ({ logger, err, messageId }) => {
  logger.error('Publisher error', err, messageId);
};
