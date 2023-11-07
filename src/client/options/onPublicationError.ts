import { LoggerService } from '@nestjs/common';

export type OnPublicationErrorContext = {
  logger: LoggerService;
  err: any;
  messageId: string;
};

export type onPublicationErrorFn = ({ logger, err, messageId }: OnPublicationErrorContext) => Promise<void>;
