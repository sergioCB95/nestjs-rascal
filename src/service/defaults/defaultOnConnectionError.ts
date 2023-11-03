import { LoggerService } from '@nestjs/common';

export const defaultOnConnectionError = (logger: LoggerService) => async (err: unknown) => {
  logger.error('Rascal connection error', err);
};
