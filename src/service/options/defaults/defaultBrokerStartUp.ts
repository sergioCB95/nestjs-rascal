import { BrokerSetUpFn } from '../brokerSetUp';

export const defaultBrokerSetUp: BrokerSetUpFn = async ({ logger }) => {
  logger.debug ? logger.debug('Running default broker setup') : null;
};
