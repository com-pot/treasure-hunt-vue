<script lang="ts" setup>
import ClueCard from "@src/modules/treasure-hunt/Backstage/components/ClueCard.vue";
import {PropType, ref} from "vue";
import { QrData } from "../Qr";

const props = defineProps({
  clueData: {type: Object as PropType<QrData>, required: true},

  viewMode: {type: String, validator: (value) => ['cards', 'table'].includes(value as string), default: 'cards'},
  cutBorder: {type: Boolean},
})

</script>

<template>
  <div class="qr-doc" v-if="viewMode === 'cards'">
    <template v-for="(group, i) in clueData.cardGroups">
      <template v-if="i">
        <div class="clear"></div>
        <div class="page-break" v-if="group.breakPage !== false"/>
      </template>

      <template v-for="clue in group.cards">
        <ClueCard :text="clue.text" :qr-opts="clue.opts"
                  :class="[clue.class, group.every?.class, cutBorder && '-cut-border']"
                  :style="[clue.bg && `--clue-bg: url(${clue.bg})`]"
        >
          <span v-if="clue.label" class="label">{{ clue.label }}</span>
          <img v-if="clue.image" :src="clue.image" :style="clue.imageStyle">
          
          <template #codeInner v-if="clue.imageInner">
            <img :src="clue.imageInner" alt="">
          </template>
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
      <template v-for="(group, iGroup) in clueData.cardGroups">
        <template v-for="(clue, i) in group.cards">
          <tr>
            <td>{{group.name}}:{{ i }}</td>
            <td>{{ clue.text }}</td>
            <td>{{ clue.label}}</td>
          </tr>
        </template>
      </template>

      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
.qr-doc {
  --gap: 0.1cm;

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

  .label {
    white-space: break-spaces;
    text-align: center;
  }

  .qr-wrapper {
    display: grid;
    place-items: center;
    > * {
      grid-area: 1 / 1;
    }

    img {
      max-width: 30%;
      max-height: 30%;
      padding: 0.1cm;
      background: white;
    }
  }

  &.-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  &.-landscape {
    display: flex;
    flex-direction: row;
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
  &.-totp {
    position: relative;

    width: 9cm;
    height: 5cm;
    display: flex;
    justify-content: space-between;
    padding-inline-end: 0.2cm;

    img {
      align-self: center;
      max-width: 55%;
      rotate: 0.3deg;
    }
    .label {
      position: absolute;
      inset-inline-end: 2cm;
      inset-block-start: 2.25cm;
      font-weight: bold;
      color: white;
      z-index: 1;
    }
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
    .qr-wrapper {
      place-self: end;
      z-index: 2;
      margin: 0.1cm;
    }
  }
}

</style>
