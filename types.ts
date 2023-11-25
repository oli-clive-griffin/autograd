export type OpCall = { op: string, args: [Expr, Expr] }
export type Expr = { val: number, resultOf?: OpCall }

export type d_OpCall = { op: string, args: [d_Expr, d_Expr]  }
export type d_Expr = { dVal: number, preCall?: d_OpCall }

export type AbstractAxpr = (
    | { type: 'abstractparam' }
    | { type: 'abstractopcall', abstractopcall: AbstractOpCall }
)

export type AbstractOpCall = {
    op: string // could be type op
    args: [AbstractAxpr, AbstractAxpr]
}

export type Params = (
    | { type: 'param', val: number }
    | { type: 'opcallparams', opcallparams: OpCallParams }
)

export type OpCallParams = {
    args: [Params, Params]
}

export type Bin = {
    l: (l: AbstractAxpr, r: AbstractAxpr) => AbstractAxpr,
    f: (l: Expr, r: Expr) => Expr,
    fp: (l: Params, r: Params) => Params,
    b: (upstreamG: number, l_inter: number, r_inter: number) => ({ dL: number, dR: number }),
}

export type UpdateFN = (p: number, d: number) => number;
