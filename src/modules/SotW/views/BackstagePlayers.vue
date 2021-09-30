<template>
  <BackstageNavigation/>

  <div class="backstage -players">
    <div class="list">
      <div class="player" v-for="player in players" :key="player.login"
           :class="getPlayerStatus(player)"
      >
        <div class="actions">
          <div class="edit" @click.prevent="editPlayer.toggle(player, 'edit')">🔧</div>
          <div class="trophy" v-if="player.trophy" @click.prevent="editPlayer.toggle(player, 'trophy')">🏆</div>
        </div>


        <div class="name">{{ player.login }}</div>
        <div class="progression">{{ challengeName(player.currentChallenge) }}</div>
        <div class="more" v-if="editPlayer.login === player.login">
          <div class="input-pair" v-if="editPlayer.mode === 'edit'">
            <input v-model="editPlayer.newPass" placeholder="Nové heslo">
            <button @click="editPlayer.changePass()">Ok</button>
          </div>

          <div class="trophy-status -acquired" v-if="editPlayer.mode === 'trophy' && player.trophy">
            <span>Pořadí: {{ player.trophy.order }} ({{ getTrophyValue(player.trophy) }})</span>
            <button class="btn btn-vivid -sm" @click.prevent="redeemTrophy(player)" :disabled="!!player.trophy.redeemedAt">Vyplatit</button>
            <div v-if="player.trophy.redeemedAt">Vyplaceno {{ new Date(player.trophy.redeemedAt).toLocaleString() }}</div>
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
      mode: undefined as string|undefined,
      newPass: '',

      toggle(player?: any, mode?: string) {
        editPlayer.newPass = ''
        editPlayer.login = !player || (editPlayer.login === player.login && mode === editPlayer.mode) ? null : player.login
        editPlayer.mode = mode
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
    const getPlayerStatus = (player: any) => {
      if (!player.currentChallenge) {
        return 'inactive'
      }
      if (!player.trophy) {
        return 'active'
      }
      if (!player.trophy.redeemedAt) {
        return 'finished'
      }
      return 'finished redeemed'
    }

    const trophyValues = [500, 300, 150]
    const getTrophyValue = (trophy: any) => {
      return trophyValues[trophy.order - 1] || 50
    }

    const redeemTrophy = (player: any) => {
      api.post(`/backstage/treasure-hunt/dashboard/player/${player.login}/trophy/redeem`)
        .then((result: any) => player.trophy = result.trophy)
    }

    return {
      players,
      editPlayer,

      challengeName,
      getPlayerStatus,
      getTrophyValue,

      redeemTrophy,
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
    border: dimgray 2px solid;

    display: grid;
    grid-auto-flow: row;

    .name, .actions {
      grid-column: 1;
      grid-row: 1;
    }

    .actions {
      place-self: start end;
      display: flex;
    }


    &.inactive {
      background: rgba(lightgray, 0.2);
      order: 2;
    }
    &.active {
      background: rgba($vivid, 0.2);
    }
    &.finished {
      background: rgba(orange, 0.2);

      &.redeemed {
        background: rgba(white, 0.2);
      }
    }
  }
}
</style>
