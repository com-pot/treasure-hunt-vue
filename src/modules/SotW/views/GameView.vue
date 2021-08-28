<template>
  <Navigation ref="navigation">
    <div class="navigation-section">
      <span class="section-title">Příběh</span>
      <nav :class="['story-part']" v-for="(link, i) in storyLinks" :key="'node-' + i" @click="$refs.navigation.isOpen = false">
        <router-link class="name" :to="link.to">
          <span>{{ link.text }}</span>
        </router-link>
      </nav>
    </div>

    <div class="navigation-section mt-auto">
      <span class="section-title">Návštěva</span>
      <nav @click="signOut">
        <span>Ukončit</span>
      </nav>
    </div>
  </Navigation>

  <router-view v-if="viewState === 'ready'"></router-view>
</template>

<script lang="ts">
import {computed, ref} from "vue";
import Navigation from "@/modules/Layout/components/Navigation.vue";
import authStore from "@/modules/Auth/authStore";
import {RouteLocationRaw, useRoute, useRouter} from "vue-router";

import playerStore from "@/modules/SotW/playerStore";
import {useSotwApi, useSotwAudio} from "@/modules/SotW/services"
import {ViewState} from "@/modules/SotW/types/views";

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

    const viewState = ref<ViewState>('loading')

    sotwAudio.preloadFiles()
      .then(() => console.log("Audio ready"));

    const storyPartTitles = ref<{[key: string]: string}>({});
    sotwApi.loadStoryTitles().then((titles) => storyPartTitles.value = titles);

    const storyLinks = computed<StoryLink[]>(() => {
      return playerStore.revealedStoryNodes.value.map((node) => {
        const link: StoryLink =  {
          text: storyPartTitles.value[node.storyPartId] || 'Neznámá část příběhu - ' + node.storyPartId,
          to: {name: 'sotw.NodeView', params: {nodeId: node.nodeId}},
        }

        return link
      })
    });

    if ($route.name === 'sotw.Game') {
      $router.replace(storyLinks.value[0].to)
    }

    sotwApi.loadPlayerProgression()
      .then((nodes) => {
        playerStore.progression.value.revealedNodes = nodes
        viewState.value = 'ready'
      })
      .catch((err) => {
        viewState.value = 'error'
        throw err
      })

    return {
      storyLinks,
      signOut: () => {
        authStore.actions.signOut()
        $router.push({name: 'Landing.welcome'})
      },
      viewState,
    }
  },
}
</script>
