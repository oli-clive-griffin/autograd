import { zipMap } from './utils';

export type Op = {
    forward: (...args: Expr[]) => Expr,
    backward: (upstreamG: number, ...intermediates: number[]) => number[],
    toJSON?: () => string,
}

export type OpCall = { op: Op, args: Expr[] }
export type Expr = { val: number, resultOf?: OpCall, __param?: boolean }

export type d_OpCall = { args: d_Expr[] }
export type d_Expr = { dVal: number, preCall?: d_OpCall, __param?: boolean }

export type UpdateFN = (p: number, d: number) => number;

export function backCall(call: OpCall, upstream: number): d_OpCall {
    const { op, args } = call;
    const grads = op.backward(upstream, ...args.map(a => a.val));

    return {
        args: zipMap(backExpr, args, grads)
    };
}

export function backExpr(expr: Expr, upstream = 1): d_Expr {
    return {
        dVal: upstream,
        preCall: expr.resultOf && backCall(expr.resultOf, upstream),
        __param: expr.__param,
    };
}

export function getDexprParamGrads(d_expr: d_Expr): number[] {
    if (d_expr.preCall != null) {
        return getDopcallParamGrads(d_expr.preCall)
    }
    if (d_expr.__param) {
        return [d_expr.dVal]
    }
    return []
}

export function getDopcallParamGrads(d_opCall: d_OpCall): number[] {
    return d_opCall.args.map(getDexprParamGrads).flat()
}

export const back = (expr: Expr) => getDexprParamGrads(backExpr(expr))

export const param = (val: number): Expr => ({ val, __param: true })
export const statick = (val: number): Expr => ({ val })
