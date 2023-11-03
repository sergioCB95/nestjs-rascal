import { LoggerService } from '@nestjs/common';

export const defaultBrokerSetUp = (logger: LoggerService) => async () => {
  logger.debug ? logger.debug('Running default broker setup') : null;
};
