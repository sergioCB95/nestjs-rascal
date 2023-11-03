export const defaultOnPublicationError =
  (logger) =>
  async (err: any, messageId: string): Promise<void> => {
    logger.error('Publisher error', err, messageId);
  };
