function l(a: any) { console.log(JSON.stringify(a, null, 2)) }

type opcall = { op: string, args: [expr, expr] }
type expr = { val: number, resultOf?: opcall }

type d_opcall = { op: string, args: [d_expr, d_expr]  }
type d_expr = { dVal: number, preCall?: d_opcall }

type abstractexpr = (
    | { type: 'abstractparam' }
    | { type: 'abstractopcall', abstractopcall: abstractopcall }
)

type abstractopcall = {
    op: string // could be type op
    args: [abstractexpr, abstractexpr]
}

//=====================

type params = (
    | { type: 'param', val: number }
    | { type: 'opcallparams', opcallparams: opcallparams }
)

type opcallparams = {
    args: [params, params]
}

type Bin = {
    l: (l: abstractexpr, r: abstractexpr) => abstractexpr,
    f: (l: expr, r: expr) => expr,
    fp: (l: params, r: params) => params,
    b: (upstreamG: number, l_inter: number, r_inter: number) => ({ dL: number, dR: number }),
}


const add: Bin = {
    l(l, r) {
        return {
            type: 'abstractopcall',
            abstractopcall: {
                op: 'add',
                args: [l, r]
            }
        }
    },
    f(l, r) {
        return {
            val: l.val + r.val,
            resultOf: { op: 'add', args: [l, r] }
        }
    },
    b(upstreamG, l_inter, r_inter) {
        return {
            dL: upstreamG,
            dR: upstreamG,
        }
    },
    fp(l, r) {
        return {
            type: 'opcallparams',
            opcallparams: {
                args: [l, r],
            }
        }
    },
}

const mul: Bin = {
    l(l, r) {
        return {
            type: 'abstractopcall',
            abstractopcall: {
                op: 'mul',
                args: [l, r]
            }
        }
    },
    f(l, r) {
        return {
            val: l.val * r.val,
            resultOf: { op: 'mul', args: [l, r] }
        }
    },
    b(upstreamG, l_inter, r_inter) {
        const dL = upstreamG * r_inter
        const dR = upstreamG * l_inter
        return { dL, dR }
    },
    fp(l, r) {
        return {
            type: 'opcallparams',
            opcallparams: {
                args: [l, r],
            }
        }
    },
}

function getBack(op: string) {
    switch (op) {
        case 'add': return add.b;
        case 'mul': return mul.b;
        default: throw new Error('back func not found');
    }
}

function getForward(op: string) {
    switch (op) {
        case 'add': return add.f;
        case 'mul': return mul.f;
        default: throw new Error('forward func not found');
    }
}

const backCall = (call: opcall, upstream: number): d_opcall => {
    const { op, args: [l, r] } = call

    const { dL, dR } = getBack(call.op)(upstream, l.val, r.val)

    return {
        op,
        args: [
            backExpr(l, dL),
            backExpr(r, dR),
        ]
    }
}

const backExpr = (expr: expr, upstream = 1): d_expr => {
    return {
        dVal: upstream,
        preCall: expr.resultOf == null
            ? undefined
            : backCall(expr.resultOf, upstream)
    }
}

const arg = (val: number): expr => ({ val })

//=====================

const evaluateAbstractOpCall = (opcall: abstractopcall, params: opcallparams): expr => {
    const { op, args: [l, r] } = opcall
    const { args: [pl, pr] } = params
    const f = getForward(op)

    return f(
        evaluateAbstractExpr(l, pl),
        evaluateAbstractExpr(r, pr),
    )
}

const evaluateAbstractExpr = (expr: abstractexpr, params: params): expr => {
    if (expr.type === 'abstractparam' && params.type === 'param') {
        return { val: params.val }
    }
    if (expr.type === 'abstractopcall' && params.type === 'opcallparams') {
        return evaluateAbstractOpCall(expr.abstractopcall, params.opcallparams)
    }
    throw new Error(`shapes did not match, got ${expr.type} and ${params.type}`)
}



const emptyparam = (): abstractexpr => ({ type: 'abstractparam' })
const myExprUnparam = mul.l(add.l(mul.l(emptyparam(), emptyparam()), emptyparam()), emptyparam())
l({ myExprUnparam })

const param = (val: number): params => ({ val, type: 'param' })
const m2 = param(5)
const x2 = param(4)
const b2 = param(3)
const c2 = param(3)

const myExprparams = mul.fp(add.fp(mul.fp(m2, x2), b2), c2) // todo make expr->params mapping instead
l({ myExprparams })

const evaled = evaluateAbstractExpr(myExprUnparam, myExprparams)
l({ evaled })

const grads = backExpr(evaled)
l({ grads })

