# RemoteData
## A Fork of [remote-data-ts](https://github.com/devex-web-frontend/remote-data-ts)

### Description

RemoteData is an ADT (algebraic data type) described in [this
article](https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b).
Heavily based on [fp-ts](https://github.com/gcanti/fp-ts) lib.

### How is this different from `devex-web-frontend/remote-data-ts`?

- The main difference is the addition of another type in the union:
  `RemoteRefresh` which captures the state where you have data, but you are
  refreshing it from your remote data source.
  - Considered a `Right`
    - The value in `RemoteRefresh` will be mapped over, etc.
    - `#toOption` returns `Some`
- Did some reorganizing of the code for personal ergonomics.
- Added a `caseOf` method that is an object version of `fold` since there are so
  many states! Inspired by `daggy`'s `#cata` method.

### Installation

```bash
npm i --save @scotttrinh/remote-data-ts
```

### How to lift (wrap) your data in RemoteData:
RemoteData is an union of few types: `RemoteInitial`, `RemotePending`,
`RemoteFailure`, `RemoteRefresh`, and `RemoteSuccess`.

While your data in **initial** or **pending** state just use the `initial` or
`pending` constant.

```ts
import { initial, pending } from '@scotttrinh/remote-data-ts';

const customers = initial;
// or
const customers = pending;
```

When you receive data from server, use the `failure` or `success` constructor:

```ts
import { failure, success } from '@scotttrinh/remote-data-ts';
import { apiClient } from 'apiClient';
import { TCustomer } from './MyModel';

const getCustomers = (): RemoteData<Error, TCustomer[]> => {
   const rawData: TCustomer[] = apiClient.get('/customers');

   try {
        const length = rawData.length;

        return success(rawData);
   }
   catch(err) {
        return failure(new Error('parse error'));
   }
}
```

When you need to re-fetch or refresh your data, use the `refresh` constructor.

### How to fold (unwrap) your data from RemoteData:
Finally you pass data to the component and want to render values, so now it's time to get our values back from RemoteData wrapper:

```ts
import { NoData, Pending, Failure } from './MyPlaceholders';
import { TCustomer } from './MyModel';

type TCustomersList = {
    entities: RemoteData<TCustomer[]>;
};

const CustomersList: SFC<TCustomersList> = ({ entities }) => entities.foldL(
    () => <NoData />,
    () => <Pending />,
    err => <Failure error={err} />,
    stale => <Refreshing oldItems={stale} />
    data => <ul>{data.map(item => <li>{item.name}</li>)}</ul>
);
```
