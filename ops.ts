import { Op } from './lib'

export const add: Op = {
    toJSON: () => 'add',
    forward(...args) {
        return {
            val: args.reduce((a, c) => a + c.val, 0),
            resultOf: { op: add, args }
        };
    },
    backward(upstreamG, ...intermediates) {
        const asdf = [...new Array(intermediates.length).fill(0).map(_ => upstreamG)]
        return asdf
    },
};

export const mul: Op = {
    toJSON: () => 'mul',
    forward(...args) {
        return {
            val: args.reduce((a, c) => a * c.val, 1),
            resultOf: { op: mul, args }
        };
    },
    backward(upstreamG, ...intermediates) {
        if (intermediates.length !== 2) throw new Error('cant be bothered implementing product else self')
        const [l_inter, r_inter] = intermediates
        const dL = upstreamG * r_inter;
        const dR = upstreamG * l_inter;
        return [dL, dR];
    },
};

export const sin: Op = {
    toJSON: () => 'sin',
    forward(...args) {
        if (args.length != 1) throw new Error('cannot call `sin` op with more than 1 arg')
        const [arg] = args
        return {
            val: Math.sin(arg.val),
            resultOf: { op: sin, args }
        };
    },
    backward(upstreamG, ...intermediates) {
        if (intermediates.length != 1) throw new Error('cannot call `sin` op with more than 1 arg')
        const [int] = intermediates
        return [Math.cos(int) * upstreamG]
    },
};

export const cos: Op = {
    toJSON: () => 'cos',
    forward(...args) {
        if (args.length != 1) throw new Error('cannot call `cos` op with more than 1 arg')
        const [arg] = args
        return {
            val: Math.cos(arg.val),
            resultOf: { op: cos, args }
        };
    },
    backward(upstreamG, ...intermediates) {
        if (intermediates.length != 1) throw new Error('cannot call `cos` op with more than 1 arg')
        const [int] = intermediates
        return [-Math.sin(int) * upstreamG]
    },
};

export const sq: Op = {
    toJSON: () => 'sq',
    forward(...args) {
        if (args.length != 1) throw new Error('cannot call `sq` op with more than 1 arg')
        const [arg] = args
        return {
            val: arg.val ** 2,
            resultOf: { op: sq, args }
        };
    },
    backward(upstreamG, ...intermediates) {
        if (intermediates.length != 1) throw new Error('cannot call `sq` op with more than 1 arg')
        const [int] = intermediates
        return [2 * int * upstreamG]
    },
};
