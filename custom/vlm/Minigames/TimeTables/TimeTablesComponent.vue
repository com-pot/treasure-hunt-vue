<template>
  <div class="minigame time-tables flow">
    <div class="travel-plan tile">
      <template v-for="(destination, i) in fare.stopsDestinations">
        <div class="choice-done" v-if="i">➜</div>
        <div class="stop"
             :class="[!i && '-start', destination.key === challengeConfig.finish && '-finish']"
        >{{ destination.name }}</div>
      </template>

      <div class="choice-pending" v-if="fare.visibleConnections?.length">
        <div class="symbol" v-for="i in 3" :style="`--o: ${i};`">.</div>
      </div>
    </div>

    <div class="travel-options">
      <div class="connection tile" v-for="connection in fare.visibleConnections">
        <div class="name">{{ connection.destination.name }}</div>
        <button class="btn -sm" @click="fare.travelTo(connection.destination.key)">Jet</button>
        <div class="departures">
          * nečitelné *
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import {computed, defineComponent, PropType, reactive} from "vue"
import {TimeTablesConfig} from "@custom/vlm/Minigames/TimeTables/timeTablesModel"


export default defineComponent({
  props: {
    // challengeConfig: {type: Object as PropType<TimeTablesConfig>, required: true},
    savedAnswer: {type: String},
  },

  setup(props, {emit}) {
    const challengeConfig = reactive<TimeTablesConfig>({
      destinations: [
        {key: 'mgdl', name: "Magdalena"},
        {key: 'chhh', name: "Chihuahua"},
        {key: 'cssg', name: "Casas Grandes"},
        {key: 'hrms', name: "Hermosillo"},
        {key: 'trrn', name: "Torreón"},
        {key: 'prrl', name: "Parral"},
        {key: 'lfrt', name: "El fuerte"},
        {key: 'jssm', name: "Jesus Maria"},
        {key: 'bnvs', name: "Buena vista"},
        {key: 'clcn', name: "Culicán"},
        {key: 'drng', name: "Durango"},
      ],
      connections: [
        {from: 'mgdl', to: 'chhh', departures: []},
        {from: 'mgdl', to: 'cssg', departures: []},
        {from: 'mgdl', to: 'hrms', departures: []},
        {from: 'mgdl', to: 'drng', departures: []},

        {from: 'chhh', to: 'trrn', departures: []},
        {from: 'cssg', to: 'prrl', departures: []},
        {from: 'cssg', to: 'lfrt', departures: []},
        {from: 'hrms', to: 'jssm', departures: []},
        {from: 'hrms', to: 'bnvs', departures: []},

        {from: 'prrl', to: 'drng', departures: []},
        {from: 'lfrt', to: 'clcn', departures: []},
        {from: 'jssm', to: 'drng', departures: []},
        {from: 'bnvs', to: 'clcn', departures: []},

        {from: 'trrn', to: 'drng', departures: []},
        {from: 'clcn', to: 'drng', departures: []},
      ],

      start: 'mgdl',
      finish: 'drng',
    })
    const fare = reactive({
      stops: [challengeConfig.start],

      stopsDestinations: computed(() => fare.stops.map((stop) => {
        return challengeConfig.destinations.find((d) => d.key === stop)
      })),

      currentDestination: computed(() => fare.stopsDestinations[fare.stops.length - 1]),
      visibleConnections: computed(() => challengeConfig.connections
          .filter((c) => c.from === fare.currentDestination.key)
          .map((c) => ({
            ...c,
            destination: challengeConfig.destinations.find((d) => d.key === c.to),
          }))
      ),

      travelTo(destination: string) {
        const connection = fare.visibleConnections.find((c) => c.to === destination)
        if (!connection) {
          console.error("Invalid travel destination " + destination)
          return
        }
        fare.stops.push(destination)

        if (destination === challengeConfig.finish) {
          emit('check-solution', fare.stops.join('-'))
        }
      },
    })

    if (props.savedAnswer) {
      fare.stops.splice(0)
      fare.stops.push(...props.savedAnswer.split('-'))
    }

    return {
      fare,
      challengeConfig,
    }
  },
})
</script>

<style lang="scss">
.minigame.time-tables {
  .travel-plan {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    background: var(--neutral-800);

    .choice-pending {
      display: flex;
      gap: 0.5rem;

      .symbol {
        animation: bounce-choice 1s infinite alternate ease-in-out;
        animation-delay: calc(var(--o) * 0.3s);

        transform: translateY(calc(var(--bounce-offset, 0) * 1rem));
      }
    }
  }

  .travel-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30ch, 1fr));
    gap: 1rem;
  }

  .connection {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr auto;

    background: var(--neutral-800);

    .departures {
      grid-column: 1 / -1;
    }
  }

}

@property --bounce-offset {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@keyframes bounce-choice {
  0% {
    --bounce-offset: -0.2;
  }
  100% {
    --bounce-offset: 0.2;
  }
}
</style>
