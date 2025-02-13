import { FixRatioContainer } from "../Common/FixRatioContainer"
import { LayerWidth, LayerHeight } from "../Core/Constants"
import { injectable, Container as IOC } from "inversify"
import { GameState } from "../Core/GameState"
import { SpriteInfo, NumberSpriteInfo, PositionInfo, setPositionInfo } from "../Common/InfoObject/InfoType"
import { TextStyle, Text } from "pixi.js"
import { GlobalEvents, Resources } from "../Utils/SymbolClasses"
import { InfoSprite } from "../Common/InfoObject/InfoSprite"
import { GameLoadConfig, GameConfig } from "../Core/GameConfig"
import { InfoNumberSprite } from "../Common/InfoObject/InfoNumberSprite"
import { AutoPlayLayer } from "./Sublayers/AutoPlayLayer"
import { ResultInfo } from "../Common/ResultInfo"

type FinishLayerInfo = {
    name?: {
        position: PositionInfo
        style: TextStyle
    }
    retry: SpriteInfo
    back: SpriteInfo

    score: NumberSpriteInfo
    perfect: NumberSpriteInfo
    great: NumberSpriteInfo
    good: NumberSpriteInfo
    bad: NumberSpriteInfo
    miss: NumberSpriteInfo
    combo: NumberSpriteInfo

    fullcombo: SpriteInfo

    other?: SpriteInfo[]
}

@injectable()
export class FinishLayer extends FixRatioContainer {
    constructor(
        state: GameState,
        events: GlobalEvents,
        resources: Resources,
        loadcfg: GameLoadConfig,
        ioc: IOC,
        config: GameConfig,
        resultInfos: ResultInfo
    ) {
        super(LayerWidth, LayerHeight)

        if (!config.autoplay) {
            resultInfos.results.push({
                maxCombo: state.maxCombo,
                fullCombo: state.maxCombo === state.map.combo,
                perfect: state.perfect,
                great: state.great,
                good: state.good,
                bad: state.bad,
                miss: state.miss,
            })
        }

        this.resize(...events.Resize.prevArgs)
        events.Resize.add((remove, w, h) => {
            if (!this.parent) return remove()
            this.resize(w, h)
        })

        const info = resources.ui.data.info.score as FinishLayerInfo
        const textures = resources.ui.textures

        if (info.other instanceof Array) {
            for (const x of info.other) {
                this.addChild(new InfoSprite(x, textures))
            }
        }

        const numbers = ["perfect", "great", "good", "bad", "miss", "score", "combo"] as [
            "perfect",
            "great",
            "good",
            "bad",
            "miss",
            "score",
            "combo"
        ]
        numbers.forEach(x => {
            const n = new InfoNumberSprite(info[x], textures!)
            if (x === "combo") n.setValue(state.maxCombo)
            else n.setValue(state[x])
            this.addChild(n)
        })

        if (state.maxCombo === state.map.combo) {
            this.addChild(new InfoSprite(info.fullcombo, textures))
        }

        if (info.name) {
            const name = new Text(loadcfg.songName, info.name.style)
            setPositionInfo(name, info.name.position)
            this.addChild(name)
        }

        const retry = new InfoSprite(info.retry, textures)
        const back = new InfoSprite(info.back, textures)
        retry.interactive = true
        //        retry.buttonMode = true
        back.interactive = true
        //        back.buttonMode = true

        retry.once("pointertap", () => {
            this.onRetry()
        })
        back.once("pointertap", () => {
            this.onBack()
        })

        this.addChild(retry, back)

        events.Update.add((remove, dt) => {
            if (!this.parent) return remove()
            for (const x of this.children) {
                if (x instanceof InfoSprite || x instanceof InfoNumberSprite) {
                    x.update(dt)
                }
            }
        })

        if (config.autoplay) {
            this.addChild(ioc.resolve(AutoPlayLayer))
        }
    }

    onRetry = () => {
        /** */
    }
    onBack = () => {
        /** */
    }
}
