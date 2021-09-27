<template>
  <Navigation ref="navigation">
    <div class="navigation-section">
      <span class="section-title">Příběh</span>
      <nav :class="['story-parts']" @click="$refs.navigation.isOpen = false">
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
import Navigation from "@/modules/Layout/components/Navigation.vue";
import authStore from "@/modules/Auth/authStore";
import {RouteLocationRaw, useRoute, useRouter} from "vue-router";

import {useSotwApi, useSotwAudio} from "@/modules/SotW/services"
import {hasComponentStatus} from "@/modules/SotW/utils/componentHelpers"
import {PlayerProgression} from "@/modules/SotW/types/game"

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
    const sotwApi = useSotwApi()
    const sotwAudio = useSotwAudio()

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
          to: {name: 'sotw.NodeView', params: {nodeId: partOfStory.slug}},
        }

        return link
      })
    });

    sotwApi.listStoryParts('sotw')
        .then((parts) => playerProgression.storyParts = parts)
        .then(() => {
          componentStatus.value = 'ready'
          if ($route.name === 'sotw.Game') {
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
    }
  },
}
</script>
