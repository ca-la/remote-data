import { RemoteData } from '../../remote-data';

export interface TestContext {
  initialRD: RemoteData<string, number>;
  pendingRD: RemoteData<string, number>;
  refreshRD: RemoteData<string, number>;
  successRD: RemoteData<string, number>;
  failureRD: RemoteData<string, number>;
}
