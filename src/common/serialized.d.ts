export type Serialized<T> = {
  [K in keyof T]: T[K] extends (Date | null) ?
    string :
    T[K] extends object ? Serialized<T[K]> : T[K] extends Function ? never :
    T[K] extends (infer U)[] ? Serialized<U>[] : T[K];
};
