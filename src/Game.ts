import "reflect-metadata"
import { Ticker } from "./Common/Ticker"
import { GameConfig, GameLoadConfig } from "./Core/GameConfig"
import { Container } from "inversify"
import { LoadingScene } from "./Scenes/LoadingScene"
import { GlobalEvents, MainStage } from "./Utils/SymbolClasses"
import { addAutoListener } from "./Utils/Utils"
import { SceneSwitcher } from "./Scenes/SceneSwitcher"
import { Renderer, autoDetectRenderer, utils } from "pixi.js"
import { Result, ResultInfo } from "./Common/ResultInfo"

type Optional<T> = {
    [prop in keyof T]?: T[prop]
}

export class Game {
    private readonly renderer: Renderer
    private readonly stage = new MainStage()
    private readonly ticker = new Ticker()
    private readonly ioc = new Container({ skipBaseClassChecks: true })
    private readonly events = new GlobalEvents()
    private readonly resultInfos = new ResultInfo()

    constructor(canvas: HTMLCanvasElement, config: Optional<GameConfig>, loadConfig: Optional<GameLoadConfig>) {
        if (!GameConfig.validate(config)) {
            throw new Error("invalid GameConfig")
        }
        if (!GameLoadConfig.validate(loadConfig)) {
            throw new Error("invalid GameLoadConfig")
        }

        this.renderer = autoDetectRenderer({
            view: canvas,
            width: canvas.clientWidth,
            height: canvas.clientHeight,
            resolution: config.resolution,
        })

        this.ioc.bind(Container).toConstantValue(this.ioc)
        this.ioc.bind(MainStage).toConstantValue(this.stage)
        this.ioc.bind(GlobalEvents).toConstantValue(this.events)
        this.ioc.bind(ResultInfo).toConstantValue(this.resultInfos)

        if (config instanceof GameConfig) this.ioc.bind(GameConfig).toConstantValue(config)
        else this.ioc.bind(GameConfig).toConstantValue(Object.assign(new GameConfig(), config))
        if (loadConfig instanceof GameLoadConfig) this.ioc.bind(GameLoadConfig).toConstantValue(loadConfig)
        else this.ioc.bind(GameLoadConfig).toConstantValue(Object.assign(new GameLoadConfig(), loadConfig))
        this.ioc.bind(SceneSwitcher).toSelf().inSingletonScope()

        this.ticker.Tick.add((delta, now) => {
            this.resize()
            this.events.Update.emit(delta, now)
            this.renderer.render(this.stage)
        })

        this.resize()
        this.stage.addChild(this.ioc.resolve(LoadingScene))

        addAutoListener(window, "blur", remove => {
            if (this._destroyed) return remove()
            this.events.WindowBlur.emit()
            this.ticker.Stop()
        })

        addAutoListener(window, "focus", remove => {
            if (this._destroyed) return remove()
            this.ticker.Start()
            this.events.WindowFocus.emit()
        })

        this.events.End.add(remove => {
            if (this._destroyed) return remove()
            this.destroy(this.resultInfos.results)
        })
    }

    start() {
        this.ticker.Start()
    }

    pause() {
        this.ticker.Stop()
    }

    private _destroyed = false

    ondestroyed?: (infos: Result[]) => void

    destroy(infos: Result[]) {
        if (this._destroyed) return
        this._destroyed = true
        this.ticker.Stop()
        this.ticker.Tick.clear()
        this.events.End.emit()
        for (const e in this.events) this.events[e as keyof GlobalEvents].clear()
        this.ioc.unbindAll()
        this.stage.destroy({ children: true })
        this.renderer.clear()
        this.renderer.destroy()
        utils.clearTextureCache()
        if (this.ondestroyed instanceof Function) this.ondestroyed(infos)
    }

    private resize() {
        const h = window.innerHeight
        const w = window.innerWidth
        const s = this.renderer.screen
        if (h !== s.height || w !== s.width || !this.events.Resize.prevArgs) {
            this.renderer.resize(w, h)
            this.events.Resize.emit(w, h)
        }
    }
}
