<template>
  <div class="qr-doc" v-if="viewMode === 'cards'">
    <template v-for="(group, i) in clueGroups">
      <template v-if="i">
        <div class="clear"></div>
        <div class="page-break"/>
      </template>

      <template v-for="clue in group.clues">
        <ClueCard :text="clue.text" :qr-opts="clue.opts" :class="clue.class"
                  :style="[clue.bg && `--clue-bg: url(${clue.bg})`]"
        >
          <span v-if="clue.label">{{ clue.label }}</span>
          <img v-if="clue.image" :src="clue.image" :style="clue.imageStyle">
        </ClueCard>
      </template>
    </template>
  </div>
  <div class="qr-doc" v-else>
    <table border="1">
      <thead>
      <tr>
        <td>#</td>
        <td>Kód</td>
        <td>Popis</td>
      </tr>
      </thead>
      <tbody>
      <template v-for="(group, iGroup) in clueGroups">
        <template v-for="(clue, i) in group.clues">
          <tr>
            <td>{{iGroup}}-{{ i }}</td>
            <td>{{ clue.text }}</td>
            <td>{{ clue.label}}</td>
          </tr>
        </template>
      </template>

      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import ClueCard from "@src/modules/treasure-hunt/Backstage/components/ClueCard.vue";
import {defineComponent, ref} from "vue";
import {QRCodeRenderersOptions} from "qrcode"

import imgBaterka from './qrResources/baterka.png'
import imgKleste from './qrResources/kleste.png'
import imgSroubovak from './qrResources/sroubovak.png'
import imgStafle from './qrResources/stafle.png'
import imgItemBg from './qrResources/istockphoto-1083302826-170667a.png'

type ClueGroup = {
  caption: string,
  clues: {
    text: string,
    opts?: QRCodeRenderersOptions,
    class?: string,
    label?: string,

    image?: string,
    imageStyle?: string,
    bg?: string,
  }[],
}

export default defineComponent({
  components: {
    ClueCard,
  },
  setup() {
    const viewMode = ref('cards')

    const personals: ClueGroup = {
      caption: 'Nastrčené stopy',
      clues: [],
    }

    for (let i = 0; i < 10; i++) {
      personals.clues.push({
        text: 'nerusit-pracuju',
        label: "Někdo nápomocný",

        class: '-chase -portrait -cut-border',
      })
    }

    personals.clues.push({
      text: 'huu-huuuuu', label: "Nádraží",
      class: '-chase -portrait -cut-border',
    })

    for (let i = 0; i < 4; i++) {
      personals.clues.push({
        text: 'to-mi-pozer',
        label: "Strážce zákona",

        class: '-chase -portrait -cut-border',
      })
    }
    personals.clues.push({text: 'simulant', label: 'Mlčenlivý chorche', class: '-chase -portrait -cut-border'})
    personals.clues.push({text: 'pedro-saludos', label: 'Pedro salutuje', class: '-chase -portrait -cut-border'})

    personals.clues.push({text: 'happy-hour', label: "Quattro-rosas", class: '-chase -portrait -cut-border'})

    const clueChase: ClueGroup = {
      caption: "Pronásledovačka",
      clues: [
          // Smazat labely
        {text: 've-studne-zije-vodnik', label: 'Studna', class: '-chase -portrait -cut-border'},

        {text: 'zabradli-od-slova-zabranit-takze-slez', label: 'Banka (f) zábradlí', class: '-chase -portrait -cut-border'},
        {text: 'iron-na-okna-to-nejlepsi', label: 'Banka (f) okno', class: '-chase -portrait -cut-border'},
        {text: 'racte-dale-penize-nevracime', label: 'Banka (f) dveře', class: '-chase -portrait -cut-border'}, // dvere - pristup k trezoru
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
    }

    const items: ClueGroup = {
      caption: "Předměty",
      clues: [
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

    const clueGroups = ref([
      personals,
      clueChase,
      items,
    ])

    return {
      viewMode,
      clueGroups,
    }
  },
})
</script>

<style lang="scss">
.qr-doc {
  --gap: 0.2cm;

  .clue-card {
    float: left;
    margin: 0 var(--gap) var(--gap) 0;
  }

  .section-heading {
    width: 100%;
    margin: var(--gap) 0;
  }

  .clear {
    clear: both;
  }
  .page-break {
    page-break-before: always;
    margin: 0.1cm 0;
  }

  table {
    td {
      padding: 0.5rem;
    }
  }
}

.clue-card {
  break-inside: avoid;
  page-break-inside: avoid;

  &.-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  &.-cut-border {
    border: 1px dashed dimgray;
  }

  &.-calling.-portrait {
    width: 5cm;
    height: 9cm;
  }

  &.-chase {
    width: 5cm; height: 5cm;
  }

  &.-item {
    --width: 8cm;
    --height: 10cm;
    --image-margin: 0.25cm;
    width: var(--width);
    height: var(--height);

    background: var(--clue-bg) center;
    background-size: cover;


    display: grid;

    > * {
      grid-row: 1; grid-column: 1;
    }

    img {
      z-index: 1;
      place-self: start center;

      max-width: calc(var(--width) - 2* var(--image-margin));
      max-height: calc(var(--height) - 2 * var(--image-margin) - var(--bottom-offset, 0));
      margin: var(--image-margin);

      filter: drop-shadow(0.1cm 0.3cm 0.2cm rgb(0, 0, 0));
    }
    .qr-canvas {
      place-self: end;
      z-index: 2;
      margin: 0.1cm;
    }
  }
}

</style>
