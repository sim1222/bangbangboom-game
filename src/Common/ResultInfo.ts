export class ResultInfo {
    results: Result[] = []
}

export type Result = {
    maxCombo: number
    fullCombo: boolean

    perfect: number
    great: number
    good: number
    bad: number
    miss: number
}
