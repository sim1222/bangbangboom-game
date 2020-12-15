export type ResultInfo = {
    maxCombo: number,

    perfect: number,
    great: number,
    good: number,
    bad: number,
    miss:number
};

export class ResultInfoContainer {
    clear():void {

    }

    Infos: ResultInfo[] = [];
}