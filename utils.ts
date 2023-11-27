function zip<T1, T2, R>(fn: (i1: T1, i2: T2) => R, arr1: T1[], arr2: T2[]): R[]
function zip<T1, T2, T3, R>(fn: (i1: T1, i2: T2, i3: T3) => R, arr1: T1[], arr2: T2[], arr3: T3[]): R[]
function zip(fn: (...items: any[]) => any, ...arrs: any[][]) {
    if (arrs.length === 0) return [];
    if (new Set(arrs.map(arr => arr.length)).size !== 1) throw new Error('arrays must be of same length');
    const [first, ...rest] = arrs;
    return first.map((item, i) => fn(item, ...rest.map(arr => arr[i])));
}

export { zip };
