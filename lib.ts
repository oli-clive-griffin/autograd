import {
    OpCall,
    d_OpCall,
    Expr,
    d_Expr,
    AbstractExpr,
    AbstractOpCall,
    OpCallParams,
    Params,
    UpdateFN,
} from './types'

export function backCall(call: OpCall, upstream: number): d_OpCall {
    const { op, args } = call;

    const grads = op.backward(upstream, ...args.map(a => a.val));

    return {
        args: args.map((a, i) => backExpr(a, grads[i])),
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

    return op.forward(
        evaluateAbstractExpr(l, pl),
        evaluateAbstractExpr(r, pr)
    );
}

export function evaluateAbstractExpr(expr: AbstractExpr, params: Params): Expr {
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
                args: ocp.args.map((arg, i) => i_expr(arg, docp.args[i]))
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

export const emptyparam = (): AbstractExpr => ({ type: 'abstractparam' })

export const param = (val: number): Params => ({ val, type: 'param' })

export function fp(...args: Params[]): Params {
    return {
        type: 'opcallparams',
        opcallparams: { args }
    };
};
