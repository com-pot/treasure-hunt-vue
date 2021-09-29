<template>
  <BackstageNavigation/>

  <div class="backstage -players">
    <div class="list">
      <div class="player" v-for="player in players" :key="player.login"
           :class="!player.currentChallenge && 'inactive'"
      >
        <div class="edit" @click.prevent="editPlayer.toggle(player)">⚙</div>
        <div class="name">{{ player.login }}</div>
        <div class="progression">{{ challengeName(player.currentChallenge) }}</div>
        <div class="more" v-if="editPlayer.login === player.login">
          <div class="input-pair">
            <input v-model="editPlayer.newPass" placeholder="Nové heslo">
            <button @click="editPlayer.changePass()">Ok</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from "vue"
import BackstageNavigation from "@/modules/SotW/components/BackstageNavigation.vue"
import {useApiAdapter} from "@/modules/SotW/services"
import {useAlert} from "@/modules/SotW/utils/viewUtils"

export default defineComponent({
  components: {BackstageNavigation},
  setup() {
    const api = useApiAdapter()
    const alert = useAlert()

    const players = ref<any[]>([])
    const editPlayer = reactive({
      login: null as string|null,
      newPass: '',

      toggle(player?: any) {
        editPlayer.newPass = ''
        editPlayer.login = !player || editPlayer.login === player.login ? null : player.login
      },
      changePass: () => {
        changePass(editPlayer.login!, editPlayer.newPass)
          .then(() => editPlayer.toggle())
      },
    })
    const changePass = (login: string, password: string) => {
      return api.put(`/auth/user/${login}/password`, {password: password})
        .then(() => {
          alert.fire({
            toast: true,
            text: "Heslo změněno",
            timer: 1000,
          })
        })
        .catch((err) => {
          alert.fire({
            toast: true,
            text: "Při změně nastala chyba",
            timer: 2000,
          })
          throw err
        })


    }
    const storyPartIndex = ref<Record<number, any>>({})

    api.get('/backstage/treasure-hunt/dashboard/players')
      .then((res: any) => {
        const list = res.players as any[]
        list.forEach((p) => {
          if (!p.currentChallenge) {
            p.currentChallenge = 0
          }
        })
        list.sort((a, b) => b.currentChallenge - a.currentChallenge)
        players.value = list
      })
    api.get('/backstage/treasure-hunt/story-parts')
      .then((res: any) => {
        storyPartIndex.value = Object.fromEntries(res.map((sp: any) => [sp.order, sp]))
      })

    const challengeName = (id: number) => {
      if (!id) {
        return 'Dosud nezačal hru'
      }

      const storyPart = storyPartIndex.value[id]
      if (!storyPart) {
        return id + "???"
      }

      return storyPart.title + ' - /' + storyPart.slug
    }

    return {
      players,
      editPlayer,

      challengeName,
    }
  },
})
</script>

<style lang="scss">
@import "~@/sass/vars/colors";

.backstage.-players {

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .player {
    flex: 1 0 200px;

    padding: 0.5rem;
    border-radius: 0.2em;
    background: rgba($vivid, 0.2);
    border: dimgray 2px solid;

    display: grid;
    grid-auto-flow: row;

    .name, .edit {
      grid-column: 1;
      grid-row: 1;
    }

    .edit {
      place-self: start end;
    }


    &.inactive {
      background: rgba(lightgray, 0.2);
      order: 2;
    }
  }
}
</style>
