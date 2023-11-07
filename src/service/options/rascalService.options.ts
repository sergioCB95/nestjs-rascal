import { BrokerSetUpFn } from './brokerSetUp';
import { OnConnectionErrorFn } from './onConnectionError';

export type RascalServiceOptions = {
  brokerSetUp?: BrokerSetUpFn;
  onConnectionError?: OnConnectionErrorFn;
};
