export const defaultOnConnectionError = (logger) => async (err: any) => {
  logger.error('Rascal connection error', err);
};
