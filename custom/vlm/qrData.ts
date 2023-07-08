import { defineQrData } from "@src/modules/qr/Qr";

import imgBaterka from './qrResources/baterka.png'
import imgKleste from './qrResources/kleste.png'
import imgSroubovak from './qrResources/sroubovak.png'
import imgStafle from './qrResources/stafle.png'
import imgItemBg from './qrResources/istockphoto-1083302826-170667a.png'


export default defineQrData({
    cardGroups: [
        {
            name: 'personals',
            caption: 'Nastrčené stopy',
            cards: [
                ...Array.from({length: 10}).map(() => ({
                    text: 'nerusit-pracuju',
                    label: "Někdo nápomocný",
                    class: '-chase -portrait -cut-border',
                })),
                {
                    text: 'huu-huuuuu', label: "Nádraží",
                    class: '-chase -portrait -cut-border',
                },
                ...Array.from({length: 4}).map(() => ({
                    text: 'to-mi-pozer',
                    label: "Strážce zákona",

                    class: '-chase -portrait -cut-border',
                })),
                {text: 'simulant', label: 'Mlčenlivý chorche', class: '-chase -portrait -cut-border'},
                {text: 'pedro-saludos', label: 'Pedro salutuje', class: '-chase -portrait -cut-border'},
                {text: 'happy-hour', label: "Quattro-rosas", class: '-chase -portrait -cut-border'},
            ],
        },
        {
            name: 'chase',
            caption: "Pronásledovačka",
            cards: [
                {text: 've-studne-zije-vodnik', label: 'Studna', class: '-chase -portrait -cut-border'},

                {text: 'zabradli-od-slova-zabranit-takze-slez', label: 'Banka (f) zábradlí', class: '-chase -portrait -cut-border'},
                {text: 'iron-na-okna-to-nejlepsi', label: 'Banka (f) okno', class: '-chase -portrait -cut-border'},
                {text: 'racte-dale-penize-nevracime', label: 'Banka (f) dveře', class: '-chase -portrait -cut-border'},
                {text: 'videls-tu-veverku', label: 'Banka ✅ schody', class: '-chase -portrait -cut-border'},

                {text: 'vidim-az-za-roh', label: 'General store (f) roh', class: '-chase -portrait -cut-border'},
                {text: 'ne-na-sekeru-ale-sekerou', label: 'General store (f) zepředu', class: '-chase -portrait -cut-border'},
                {text: 'a-nejhorsi-jsou-ty-neviditelny', label: 'General store ✅ za rohem', class: '-chase -portrait -cut-border'},

                {text: 'toro-toro', label: 'Dřevěná aréna (f) dveře vlevo', class: '-chase -portrait -cut-border'},
                {text: 'kohouti-zapasy-ve-utery', label: 'Dřevěná aréna (f) levá stěna', class: '-chase -portrait -cut-border'},
                {text: 'rodeo-rodeo-rodeooo', label: 'Dřevěná aréna ✅ dveře napravo', class: '-chase -portrait -cut-border'},

                {text: 'ja-mam-kone', label: 'Koně', class: '-chase -portrait -cut-border'},
                {text: 'vrany-kone', label: 'Koně', class: '-chase -portrait -cut-border'},
                {text: 'to-jsou-kone-mi', label: 'Koně', class: '-chase -portrait -cut-border'},
                {text: 'kdyz-ja-jim-dam', label: 'Koně ✅', class: '-chase -portrait -cut-border'},

                {text: 'mela-kozy-jako-vozy', label: 'Stáje', class: '-chase -portrait -cut-border'},

                {text: 'chces-maso-maso-neni-mam-caj', label: 'Čajovna', class: '-chase -portrait -cut-border'},
            ],
        },
        {
            name: 'items',
            caption: "Předměty",
            cards: [
                {
                  text: '777-sroubovak', class: '-item -cut-border',
                  image: imgSroubovak, imageStyle: '--bottom-offset: 2cm', bg: imgItemBg,
                },
                {
                  text: '420-stafle', class: '-item -cut-border',
                  image: imgStafle, imageStyle: '--bottom-offset: 1cm', bg: imgItemBg,
                },
                {
                  text: '4884-kleste', class: '-item -cut-border',
                  image: imgKleste, bg: imgItemBg,
                },
                {
                  text: '338-baterka', class: '-item -cut-border',
                  image: imgBaterka, imageStyle: '--bottom-offset: 2cm', bg: imgItemBg,
                },
              ],
        }
    ],
})