import { LoggerService } from '@nestjs/common';

export const defaultOnSubscriptionError = (logger: LoggerService) => async (err: unknown) => logger.error(err);
