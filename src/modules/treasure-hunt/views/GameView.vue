<template>
   <Navigation ref="elNavigation">
    <div class="navigation-section">
      <span class="section-title">Příběh</span>
      <nav :class="['story-parts']" @click="elNavigation.isOpen = false">
        <router-link v-for="(link, i) in storyLinks" :key="'node-' + i" :to="link.to"
                     class="btn" active-class="active"
        >
          <span>{{ link.text }}</span>
        </router-link>
      </nav>
    </div>

    <div class="navigation-section -minor mt-auto">
      <span class="section-title">Návštěva</span>
      <div>
        <button class="btn" @click="signOut">Ukončit</button>
      </div>
    </div>
  </Navigation>

  <router-view v-if="componentStatus === 'ready'"></router-view>
</template>

<script lang="ts">
import {computed, provide, reactive, ref} from "vue";
import {RouteLocationRaw, useRoute, useRouter} from "vue-router";

import Navigation from "@src/modules/Layout/components/Navigation.vue";
import authStore from "@src/modules/Auth/authStore";

import {hasComponentStatus} from "@src/modules/Layout/utils/componentHelpers"
import {useTreasureHuntApi, useSotwAudio} from "../services"
import {PlayerProgression} from "../model/TreasureHuntModel"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"

type StoryLink = {
  text: string,
  to: RouteLocationRaw,
}

export default {
  components: {
    Navigation,
  },

  setup() {
    const $router = useRouter();
    const $route = useRoute();
    const storySelection = useStorySelection()
    const thApi = useTreasureHuntApi()
    const sotwAudio = useSotwAudio()

    const elNavigation = ref<typeof Navigation|null>(null)

    const componentStatus = hasComponentStatus('loading')

    sotwAudio.preloadFiles()
      .then(() => console.log("Audio ready"));

    const playerProgression = reactive<PlayerProgression>({
      storyParts: [],
    })
    provide('player.progression', playerProgression)

    const storyLinks = computed<StoryLink[]>(() => {
      return playerProgression.storyParts.map((partOfStory) => {
        const link: StoryLink =  {
          text: partOfStory.title,
          to: {name: 'th.NodeView', params: {nodeId: partOfStory.slug}},
        }

        return link
      })
    });

    thApi.listStoryParts(storySelection.story)
        .then((parts) => playerProgression.storyParts = parts)
        .then(() => {
          componentStatus.value = 'ready'
          if ($route.name === 'th.Game') {
            $router.replace(storyLinks.value[0].to)
          }
        })
        .catch((err) => {
          componentStatus.value = 'error'
          $router.replace({name: 'Landing.welcome'})
          throw err
        })

    return {
      storyLinks,
      signOut: () => {
        authStore.actions.signOut()
        $router.push({name: 'Landing.welcome'})
      },
      componentStatus,

      elNavigation,
    }
  },
}
</script>
