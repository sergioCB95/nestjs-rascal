import { LoggerService } from '@nestjs/common';

export const defaultOnPublicationError =
  (logger: LoggerService) =>
  async (err: any, messageId: string): Promise<void> => {
    logger.error('Publisher error', err, messageId);
  };
