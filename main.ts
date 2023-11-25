import { add, mul, sin } from "./ops"
import { UpdateFN } from "./types"
import { backExpr, mapParamsExpr, evaluateAbstractExpr, param, emptyparam, fp as shape_params } from './lib'

const lg = (a: any) => console.log(JSON.stringify(a, null, 2))

// let params = shape_params(shape_params(shape_params(param(5), param(4)), param(3)), param(3)) // todo make expr->params mapping instead
// let expr = mul.abstract(add.abstract(mul.abstract(emptyparam(), emptyparam()), emptyparam()), emptyparam())

let params = shape_params(param(Math.PI * 3/2 - 0.1))
let expr = sin.abstract(emptyparam())

const update: UpdateFN = (p, d) => p - d*0.001

async function main() {
    while (true) {
        const evaled = evaluateAbstractExpr(expr, params);
        const grads = backExpr(evaled)
        params = mapParamsExpr(params, grads, update)

        console.log(evaled.val)
        await new Promise(r => setTimeout(r, 0.01))
    }
}
main()
