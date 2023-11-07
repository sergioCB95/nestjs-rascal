import { OnConnectionErrorFn } from '../onConnectionError';

export const defaultOnConnectionError: OnConnectionErrorFn = async ({ logger, err }) => {
  logger.error('Rascal connection error', err);
};
