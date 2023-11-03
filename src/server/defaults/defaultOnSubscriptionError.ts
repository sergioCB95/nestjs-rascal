export const defaultOnSubscriptionError = (logger) => async (err: any) =>
  logger.error(err);
