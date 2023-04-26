
<script lang="ts" setup>
import {computed, defineComponent} from "vue"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import useCurrentTime, {timePrint} from "@src/modules/treasure-hunt/components/useCurrentTime"
import contentBlockBase from "./contentBlockBase"

const props = defineProps({
  ...contentBlockBase.props,
})

const momentDate = computed(() => new Date(props.block.time))
const momentStr = computed(() => momentDate.value.toLocaleString())
const momentStrIso = computed(() => momentDate.value.toISOString())

const timeLeft = useCurrentTime({
  format: (d) => timePrint.dateDiffUnits(momentDate.value, d),
})
</script>

<template>
  <template v-if="viewMode === 'edit'" >
    <fieldset class="form-auto-layout">
      <TypefulInputPair type="string" name="caption" label="Nadpis"
                        v-model="block.caption" />
      <TypefulInputPair type="time" name="time" label="Čas"
                        v-model="block.time" />
    </fieldset>
  </template>

  <div class="countdown-block" :data-mode="viewMode" v-else>
    <p class="caption" v-if="block.caption">{{ block.caption }}</p>
    <time :datetime="momentStrIso" class="countdown-moment">{{ momentStr }}</time>
    <span class="time-left" v-if="timeLeft.formatted">
      <span class="preposition">za </span>
      <span class="timespan">{{ timeLeft.formatted }}</span>
    </span>
  </div>
</template>

<style lang="scss">
.countdown-block {
  display: flex;
  flex-direction: column;
  align-items: center;

  .caption {
    margin: unset;
  }

  .countdown-moment {
    font-size: 2rem;
  }
}
</style>
