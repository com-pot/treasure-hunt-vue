import { defineQrData } from "@src/modules/qr/Qr";

import swordsIco from "./assets/totp/145822-200.png"
import scheriffIco from "./assets/totp/24038-200.png"
import herbIco from "./assets/totp/1181117-200.png"
import cattleIco from "./assets/totp/1509419-200.png"
import docIco from "./assets/totp/2209833-200.png"
import laundryIco from "./assets/totp/5495826-200.png"
import keychainImg from "./assets/totp/keychain.png"

export default defineQrData({
    cardGroups: [
        {
            name: 'act',
            caption: "Aktivace",
            every: {
                class: '-portrait -chase',
            },
            cards: [
                {
                    text: 'act-start',
                    label: "Aktivace\nVýchozí bod",
                },
                {
                    text: 'act:end',
                    label: "Aktivace\nCílový bod",
                },

                { text: "act:squat", label: "Dřep" },
                { text: "act:squat", label: "Dřep" },
                { text: "act#rise", label: "Vztyk" },
                { text: "act#rise", label: "Vztyk" },

                { text: "act#the-box" },
            ],
        },
        {
            name: 'visits',
            caption: "Návštěvy",
            breakPage: false,
            
            every: {
                class: "-portrait -chase",
            },
            cards: [
                {
                    text: "medicine-man",
                    imageInner: docIco,
                    opts: {errorCorrectionLevel: 'H', version: 3},
                },
                {
                    text: "swords-guy",
                    imageInner: swordsIco,
                    opts: {errorCorrectionLevel: 'H', version: 3},
                },
                {
                    text: "herb-brewer",
                    imageInner: herbIco,
                    opts: {errorCorrectionLevel: 'H', version: 3},
                },
                {
                    text: "lawful-dude",
                    imageInner: scheriffIco,
                    opts: {errorCorrectionLevel: 'H', version: 3},
                },
                {
                    text: "cattle-mower",
                    imageInner: cattleIco,
                    opts: {errorCorrectionLevel: 'H', version: 3},
                },
                {
                    text: "laundry-lady",
                    imageInner: laundryIco,
                    opts: {errorCorrectionLevel: 'H', version: 3},
                },
            ],
        },
        {
            name: 'totp',
            caption: "TOTP",
            every: {
                class: "-totp -landscape",
            },
            cards: [
                { text: "totp:dGhlIGNvZGUgaXMgdGhlIGNvZGU=", image: keychainImg, label: "Oscar" },
                { text: "totp:cGluZWFwcGxl", image: keychainImg, label: "Romeo" },
                { text: "totp:cGl6emE=", image: keychainImg, label: "India" },
                { text: "totp:d2h5IHUgZGVjb2Rl", image: keychainImg, label: "Mike" },
                { text: "totp:ZXhjYWxpYnVy", image: keychainImg, label: "X-ray" },
                { text: "totp:aW5zdGFudCByYW1lbg==", image: keychainImg, label: "Victor" },
                { text: "totp:VE9ETzogYWRkIGNvZGUgaGVyZQ==", image: keychainImg, label: "Yankee" },
                { text: "totp:aSBzZWUgeW91", image: keychainImg, label: "Hotel" },
                { text: "totp:YmF6aW5nYQ==", image: keychainImg, label: "Foxtrot" },
                { text: "totp:cm9jayBhbmQgc3RvbmU=", image: keychainImg, label: "Tango" },
            ],
        }
    ],
})
