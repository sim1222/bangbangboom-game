const LoadingBackgroundUrl =
    "data:image/png;base64,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"

export const LoadingBackground = document.createElement("img")
LoadingBackground.src = LoadingBackgroundUrl

export const LoadingMessages = ["Loading...", "???", "在加载了", "bangbangboom 炸了多久了", "小鱼干 -20..鱼干不足"]