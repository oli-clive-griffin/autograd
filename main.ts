import { add, cos, mul, sin } from "./ops"
import { Params, UpdateFN } from "./types"
import { backExpr, mapParamsExpr, evaluateAbstractExpr, param, emptyparam, shape_params, val, getDexprParamGrads, statick } from './lib'
import { zip } from "./utils"

const lg = (a: any) => console.log(JSON.stringify(a, null, 2))
const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp

// let params = shape_params(shape_params(shape_params(param(5), param(4)), param(3)), param(3)) // todo make expr->params mapping instead
// let expr = mul.abstract(add.abstract(mul.abstract(emptyparam(), emptyparam()), emptyparam()), emptyparam())

// let params = shape_params(param(Math.PI * 3/2 - 0.1))
// let expr = sin.abstract(emptyparam())

const update: UpdateFN = (param, d_param) => param - d_param * 0.1

async function mainOld() {
    const model = (params: Params) => {
        const expr = sin.abstract(emptyparam())
        return evaluateAbstractExpr(expr, params)

    }
    let params = shape_params(param(.2)) // [.2] // , .3]
    while (true) {
        const expr = model(params)
        const d_expr = backExpr(expr)
        params = mapParamsExpr(params, d_expr, update)
        // const paramGrads = getDexprParamGrads(d_expr)
        // params = zip(update, params, paramGrads)

        lg({ params })
        await new Promise(r => setTimeout(r, 100))
    }
}

async function mainNew() {
    const model = (params: number[]) =>  mul.forward(
        sin.forward(add.forward(val(params[0]), statick(.2))),
        cos.forward(add.forward(val(params[1]), statick(0.12))),
    )
    let params = [0.1, 0.2]
    
    let i = 0
    while (true) {
        const expr = model(params)
        const d_expr = backExpr(expr)
        const paramGrads = getDexprParamGrads(d_expr)
        const newParams = zip(update, params, paramGrads)
        const diff = zip((a, b) => a - b, params, newParams)
        if (diff.every(n => Math.abs(n) < 0.000g1)) break
        params = newParams

        console.log(params.map(n => round(n, 4)))
        await new Promise(r => setTimeout(r, 200 / i + 4))
        i+=1
    }
}


mainNew()
