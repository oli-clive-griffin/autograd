import { add, mul } from "./ops"
import { UpdateFN } from "./types"
import { backExpr, mapParamsExpr, evaluateAbstractExpr, param, emptyparam } from './lib'

const lg = (a: any) => console.log(JSON.stringify(a, null, 2))

let params = mul.fp(add.fp(mul.fp(param(5), param(4)), param(3)), param(3)) // todo make expr->params mapping instead
let expr = mul.l(add.l(mul.l(emptyparam(), emptyparam()), emptyparam()), emptyparam())
const update: UpdateFN = (p, d) => p - d*0.0003

async function main() {
    while (true) {
        const evaled = evaluateAbstractExpr(expr, params);
        const grads = backExpr(evaled)
        params = mapParamsExpr(params, grads, update)

        lg({ val: evaled.val })
        await new Promise(r => setTimeout(r, 1000))
    }
}
main()
