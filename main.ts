import { add, cos, mul, sin, sq } from "./ops"
import { back, Expr, param, statick, UpdateFN } from './lib'
import { zipMap } from "./utils"

async function main() {
    const model = (params: number[]) =>  mul.forward(
        sin.forward(add.forward(param(params[0]), statick(.2))),
        cos.forward(add.forward(param(params[1]), statick(0.12))),
    )

    const loss = (x: Expr, y: number) => (
        sq.forward(add.forward(x, statick(-y)))
    )

    const forward = (params: number[], y: number) => {
        const ouput = model(params)
        return loss(ouput, y)
    }

    const updateParam: UpdateFN = (param, d_param) => param - d_param * 0.1

    let params = [0.1, 0.2]
    
    let runningLoss = Infinity
    while (runningLoss > 0.0001) {
        const loss = forward(params, 0.5)
        const paramGrads = back(loss)
        params = zipMap(updateParam, params, paramGrads)
        console.log(loss.val)
        runningLoss = loss.val
        await new Promise(r => setTimeout(r, 100))
    }
}

main()
