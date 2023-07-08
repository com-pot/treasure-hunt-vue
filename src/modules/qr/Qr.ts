import { QRCodeRenderersOptions } from "qrcode"

export function defineQrData<T extends QrData>(data: T): T {
    return data
}

export type QrData = {
    cardGroups: QrCardGroup[],
}

type QrCard = {
    text: string,
    opts?: QRCodeRenderersOptions,
    class?: string,
    label?: string,

    image?: string,
    imageStyle?: string,
    bg?: string,

    imageInner?: string,
}

export type QrCardGroup = {
    name: string,
    caption: string,
    cards: QrCard[],

    every?: {
        class?: string,
    },

    breakPage?: boolean,
}