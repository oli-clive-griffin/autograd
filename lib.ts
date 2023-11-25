import { add, mul } from './ops'
import { OpCall, d_OpCall, Expr, d_Expr, AbstractAxpr, AbstractOpCall, OpCallParams, Params, UpdateFN } from './types'

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

export function backCall(call: OpCall, upstream: number): d_OpCall {
    const { op, args: [l, r] } = call;

    const { dL, dR } = getBack(call.op)(upstream, l.val, r.val);

    return {
        op,
        args: [
            backExpr(l, dL),
            backExpr(r, dR),
        ]
    };
}

export function backExpr(expr: Expr, upstream = 1): d_Expr {
    return {
        dVal: upstream,
        preCall: expr.resultOf == null
            ? undefined
            : backCall(expr.resultOf, upstream)
    };
}

export function evaluateAbstractOpCall(opcall: AbstractOpCall, params: OpCallParams): Expr {
    const { op, args: [l, r] } = opcall;
    const { args: [pl, pr] } = params;
    const f = getForward(op);

    return f(
        evaluateAbstractExpr(l, pl),
        evaluateAbstractExpr(r, pr)
    );
}

export function evaluateAbstractExpr(expr: AbstractAxpr, params: Params): Expr {
    if (expr.type === 'abstractparam' && params.type === 'param') {
        return { val: params.val };
    }
    if (expr.type === 'abstractopcall' && params.type === 'opcallparams') {
        return evaluateAbstractOpCall(expr.abstractopcall, params.opcallparams);
    }
    throw new Error(`shapes did not match, got ${expr.type} and ${params.type}`);
}

export function mapParamsExpr(params: Params, d_expr: d_Expr, f: UpdateFN): Params {
    function i_opcall(ocp: OpCallParams, docp: d_OpCall): Params {
        return {
            type: 'opcallparams',
            opcallparams: {
                args: [
                    i_expr(ocp.args[0], docp.args[0]),
                    i_expr(ocp.args[1], docp.args[1]),
                ]
            }
        }
    }

    function i_expr(p: Params, d: d_Expr): Params {
        if (p.type === 'param' && d.preCall == null) { // leaf node
            return { type: 'param', val: f(p.val, d.dVal) }
        }
        if (p.type === 'opcallparams' && d.preCall != null) {
            return i_opcall(p.opcallparams, d.preCall)
        }
        throw new Error('shapes did not match')
    }

    return i_expr(params, d_expr)
}

export const emptyparam = (): AbstractAxpr => ({ type: 'abstractparam' })

export const param = (val: number): Params => ({ val, type: 'param' })