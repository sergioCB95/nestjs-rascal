import { AckOrNack } from 'rascal';

export type OnMessageConfig = {
  handler: (data: any) => Promise<any>;
  data: any;
  content: any;
  ackOrNack: AckOrNack;
};
