import { Op } from './types'

export const add: Op = {
    abstract(...args) {
        return {
            type: 'abstractopcall',
            abstractopcall: { op: add, args }
        };
    },
    forward(...args) {
        return {
            val: args.reduce((a, c) => a + c.val, 0),
            resultOf: { op: add, args }
        };
    },
    backward(upstreamG, ...intermediates) {
        return [...new Array(intermediates.length).fill(0).map(_ => upstreamG)]
    },
};

export const mul: Op = {
    abstract(...args) {
        return {
            type: 'abstractopcall',
            abstractopcall: { op: mul, args }
        };
    },
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

