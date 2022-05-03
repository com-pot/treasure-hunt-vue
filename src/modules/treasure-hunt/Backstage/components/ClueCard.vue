<template>
  <div class="clue-card">
    <canvas class="qr-canvas" ref="qrCanvas"/>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType, ref, watch} from "vue"
import qrcode, {QRCodeRenderersOptions} from "qrcode"

function renderQr(canvas: HTMLCanvasElement, data: string, opts: QRCodeRenderersOptions) {
  qrcode.toCanvas(canvas, data, opts.qrOpts)
}

export default defineComponent({
  props: {
    text: {type: String, required: true},
    qrOpts: {type: Object as PropType<QRCodeRenderersOptions>, default: () => ({})},
  },
  setup(props) {
    const qrCanvas = ref<HTMLCanvasElement|null>(null)

    const render = () => {
      const canvas = qrCanvas.value
      if (!canvas) {
        console.warn('canvas not ready')
        return
      }
      renderQr(canvas, props.text, props.qrOpts)
    }

    onMounted(() => {
      watch(() => props.qrOpts, render)
      watch(() => props.text, render, {immediate: true})
    })

    return {
      qrCanvas,
    }
  },
})
</script>
