import { createContext, useMemo, useState } from 'react';

interface MyState {
  myProp: string;
  loading: boolean;
}
const MyGlobalState = new Map();
const MyContext = createContext<MyState>(null as any)

const withProvider = (MyComp: React.ComponentType) => {
  const [myState, setMyState] = useState({ myProp: 'asdf', loading: false });

  const state = useMemo(() => ({
    ...myState,
    setMyState
  }), [myState, setMyState]);

  <MyContext.Provider value={state}>
    <MyComp></MyComp>
  </MyContext.Provider>
}

