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
import { zip } from './utils';

export function backCall(call: OpCall, upstream: number): d_OpCall {
    const { op, args } = call;

    const grads = op.backward(upstream, ...args.map(a => a.val));

    return {
        args: zip(backExpr, args, grads)
    };
}

export function backExpr(expr: Expr, upstream = 1): d_Expr {
    return {
        dVal: upstream,
        preCall: expr.resultOf == null
            ? undefined
            : backCall(expr.resultOf, upstream),
        __param: expr.__param,
    };
}

export function evaluateAbstractOpCall(opcall: AbstractOpCall, params: OpCallParams): Expr {
    return opcall.op.forward(
        ...zip(evaluateAbstractExpr, opcall.args, params.args)
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
                args: zip(i_expr, ocp.args, docp.args),
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

export const emptyparam = (): AbstractExpr => ({ type: 'abstractparam' })

export const param = (val: number): Params => ({ val, type: 'param' })

export const val = (val: number): Expr & any => ({ val, __param: true })
export const statick = (val: number): Expr & any => ({ val })

export function shape_params(...args: Params[]): Params {
    return {
        type: 'opcallparams',
        opcallparams: { args }
    };
};
