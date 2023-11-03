export type RascalServiceOptions = {
  brokerSetUp?: () => Promise<void>;
  onConnectionError?: (err: any) => Promise<void>;
};
