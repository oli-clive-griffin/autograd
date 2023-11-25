export type Op = {
    abstract: (...args: AbstractExpr[]) => AbstractExpr,
    forward: (...args: Expr[]) => Expr,
    backward: (upstreamG: number, ...intermediates: number[]) => number[],
}

export type OpCall = { op: Op, args: Expr[] }
export type Expr = { val: number, resultOf?: OpCall }

export type d_OpCall = { /*op: string,*/ args: d_Expr[]  }
export type d_Expr = { dVal: number, preCall?: d_OpCall }

export type AbstractExpr = (
    | { type: 'abstractparam' }
    | { type: 'abstractopcall', abstractopcall: AbstractOpCall }
)

export type AbstractOpCall = {
    op: Op // could be type op
    args: AbstractExpr[]
}

export type Params = (
    | { type: 'param', val: number }
    | { type: 'opcallparams', opcallparams: OpCallParams }
)

export type OpCallParams = {
    args: Params[]
}

export type UpdateFN = (p: number, d: number) => number;
