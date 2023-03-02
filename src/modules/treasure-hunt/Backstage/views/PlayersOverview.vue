<template>
  <h1>Přehled hráčů</h1>
  <div class="backstage -players">
    <div class="list">
      <div class="tile player" v-for="player in players" :key="player.user"
           :class="getPlayerStatus(player)"
      >
        <div class="actions">
          <div class="edit" @click.prevent="editPlayer.toggle(player, 'edit')">🔧</div>
        </div>

        <div class="name">{{ player.user }}</div>
        <div class="progression">{{ challengeName(player.currentChallenge) }}</div>
        <div class="flow more">
          <div class="chip change-pass" v-if="editPlayer.user === player.user">
            <input v-model="editPlayer.newPass" placeholder="Nové heslo">
            <button @click="editPlayer.changePass()">Ok</button>
          </div>

          <div class="chip chip-trophy" v-if="player.trophy">
            <div class="span">🏆</div>
            <span>Pořadí: {{ player.trophy.order }}</span>
            <span v-if="player._trophyValue">({{ player._trophyValue }})</span>
            <button class="btn -acc-vivid -sm" @click.prevent="redeemTrophy(player)" :disabled="!!player.trophy.redeemedAt">Vyplatit</button>

            <div class="status" v-if="editPlayer.user === player.user">
              <div v-if="player.trophy.redeemedAt">Vyplaceno {{ new Date(player.trophy.redeemedAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, reactive, ref, watch} from "vue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import {useAlert} from "@src/modules/Layout/components/viewUtils"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import {PartOfStory} from "@src/modules/treasure-hunt/model/StoryPart"
import useTreasureHuntBackstageApi from "@src/modules/treasure-hunt/api/useTreasureHuntBackstageApi"
import useGameStaticData from "@src/modules/treasure-hunt/components/useGameStaticData"

export default defineComponent({
  setup() {
    const storySelection = useStorySelection()
    const api = useApiAdapter()
    const thBackstageApi = useTreasureHuntBackstageApi(api)
    const alert = useAlert()
    const gameData = useGameStaticData()

    const players = ref<any[]>([])
    const editPlayer = reactive({
      user: null as string|null,
      mode: undefined as string|undefined,
      newPass: '',

      toggle(player?: any, mode?: string) {
        editPlayer.newPass = ''
        editPlayer.user = !player || (editPlayer.user === player.user && mode === editPlayer.mode) ? null : player.user
        editPlayer.mode = mode
      },
      changePass: () => {
        changePass(editPlayer.user!, editPlayer.newPass)
          .then(() => editPlayer.toggle())
      },
    })
    const changePass = (user: string, password: string) => {
      return api.put(`/auth/user/${user}/password`, {password: password})
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

    const storyParts = useModelCollectionController<PartOfStory>(api, 'treasure-hunt.story-part')
    const storyPartIndex = computed(() => {
      let orderEntries = (storyParts.value || []).map((sp: any) => [sp.order, sp])
      return Object.fromEntries(orderEntries)
    })

    function reload() {
      return Promise.all([
          storyParts.load(1, 100, {story: storySelection.story}),
          thBackstageApi.listPlayersByChallengeNumber(storySelection.story)
            .then((list) => {
              list.forEach((player) => player._trophyValue = getTrophyValue(player.trophy))
              return list
            })
            .then((list) => players.value = list)
      ])
    }

    watch(() => storySelection.story, reload, {immediate: true})

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

    const getTrophyValue = (trophy: any) => {
      if (!trophy || !gameData.trophyValues) {
        return
      }
      let iValue = trophy.order
      if (iValue >= gameData.trophyValues.length) {
        iValue = gameData.trophyValues.length - 1
      }

      return gameData.trophyValues[iValue]
    }

    const redeemTrophy = (player: any) => {
      api.post(`/backstage/treasure-hunt/dashboard/story/${storySelection.story}/player/${player.user}/trophy/redeem`)
        .then((result: any) => player.trophy = result.trophy)
    }

    return {
      players,
      editPlayer,

      challengeName,
      getPlayerStatus,

      redeemTrophy,
    }
  },
})
</script>

<style lang="scss">

.backstage.-players {

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;

    > .tile {
      flex: 1 0 200px;
    }
  }

  .player {
    border: 2px solid var(--neutral-600);
    display: grid;
    grid-auto-flow: row;

    .name, .actions {
      grid-column: 1;
      grid-row: 1;
    }

    .actions {
      place-self: start end;
      display: flex;
      order: 1;
    }

    .more {
      --flow-spacing: 0.5rem;
    }

    .chip {
      padding: 0.2rem;
      display: flex;
      gap: 0.2rem;
      flex-wrap: wrap;
      align-items: center;
      background-color: rgba(69, 69, 69, 0.2);

      .status {
        width: 100%;
        text-align: center;
      }
    }
    .chip-trophy {
      button {
        margin-inline-start: auto;
      }
    }
    .change-pass {
      input {
        min-width: 4ch;
        flex: 1;
      }
    }


    &.inactive {
      background: rgba(lightgray, 0.2);
      order: 2;
    }
    &.active {
      background: rgba(var(--hsl-vivid), 0.2);
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
