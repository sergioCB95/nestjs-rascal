export type OnMessageConfig = {
  handler: (data: any) => Promise<any>;
  data: any;
  content: any;
  ackOrNack: (err?: any, options?: any) => Promise<void>;
};
