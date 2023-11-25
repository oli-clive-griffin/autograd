import { Bin } from './types'

export const add: Bin = {
    l(l, r) {
        return {
            type: 'abstractopcall',
            abstractopcall: {
                op: 'add',
                args: [l, r]
            }
        };
    },
    f(l, r) {
        return {
            val: l.val + r.val,
            resultOf: { op: 'add', args: [l, r] }
        };
    },
    b(upstreamG, l_inter, r_inter) {
        return {
            dL: upstreamG,
            dR: upstreamG,
        };
    },
    fp(l, r) {
        return {
            type: 'opcallparams',
            opcallparams: {
                args: [l, r],
            }
        };
    },
};

export const mul: Bin = {
    l(l, r) {
        return {
            type: 'abstractopcall',
            abstractopcall: {
                op: 'mul',
                args: [l, r]
            }
        };
    },
    f(l, r) {
        return {
            val: l.val * r.val,
            resultOf: { op: 'mul', args: [l, r] }
        };
    },
    b(upstreamG, l_inter, r_inter) {
        const dL = upstreamG * r_inter;
        const dR = upstreamG * l_inter;
        return { dL, dR };
    },
    fp(l, r) {
        return {
            type: 'opcallparams',
            opcallparams: {
                args: [l, r],
            }
        };
    },
};

