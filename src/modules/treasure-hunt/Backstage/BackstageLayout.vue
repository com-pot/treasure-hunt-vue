<script lang="ts" setup>
import {computed, ref} from "vue"
import {useRoute} from "vue-router"

import useUser from "@src/modules/Auth/components/useUser"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"

const user = useUser()
const route = useRoute()
const storySelection = useStorySelection()

const stories = ref([
  // {key: 'sotw', title: "Spirit of the Wild"},
  // {key: 'vlm', title: "Viva la Mexico"},
  {key: 'fw', title: "FurrWorld"},
])

const contentClass = computed(() => {
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const match = route.matched[i]
    const component = match.components['default'] as any
    if (component.contentLayout) {
      return component.contentLayout
    }
  }

  return false
})

const logInTo = ref({
  name: 'Authorization', params: {formId: 'TZ-017-P'},
  query: {
    'return-to': route.name,
  },
})

</script>

<template>
  <header>
    <router-link class="brand" :to="{name: 'Backstage.SeasonDashboard'}">
      <div class="title">com-pot / treasure-hunt</div>
      <div class="subtitle">Zákulisí</div>
    </router-link>

    <nav>
      <router-link class="item" :to="{name: 'minigame.dev.index'}">Minihry</router-link>
    </nav>


    <div class="user-panel" v-if="!user.data?.login">
      <router-link :to="logInTo" class="btn -sm">Přihlásit se</router-link>
    </div>

    <div class="user-panel dropdown" v-else>
      <div class="user-frame">
        <span class="login">{{ user.data.login }}</span>
      </div>

      <div class="dropdown-container">
        <div class="items">
          <button v-for="story in stories" :key="story.key"
                :class="storySelection.story === story.key && '-acc-primary'"
                @click="storySelection.story = story.key"
          >{{ story.title }}</button>

          <div role="separator"/>
          <button @click="user.actions.signOut()">Odhlásit se</button>
        </div>
      </div>
    </div>
  </header>

  <main :class="contentClass">
    <router-view/>
  </main>
</template>

<style lang="scss">
[data-layout="backstage"] {
  min-height: 100vh;

  header {
    --header-padding: 0.5rem;
    --header-border-size: 2px;
    width: 100%;
    padding: var(--header-padding);
    
    
    border-bottom: var(--header-border-size) solid hsl(var(--hsl-primary-components));
    background-color: hsl(var(--hsl-primary-components) / 0.25);

    display: flex;
    align-items: center;
    gap: 1rem;

    .brand {
      color: black;
      text-decoration: none;

      .title {
        font-size: 1.2rem;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .user-panel {
      margin-inline-start: auto;

      display: grid;
      place-content: center;

      .user-frame {
        width: 4rem;
        height: 4rem;
        border-radius: 0.5rem;

        border: 1px solid var(--neutral-100);

        display: grid;
        place-items: center;
      }
    }

    .dropdown {
      --c-dropdown-expanded: 0;
      position: relative;
      align-self: stretch;

      .dropdown-container {
        position: absolute;
        top: calc(100% + var(--header-padding) + var(--header-border-size));
        right: 0;

        width: min(24ch, 80vw);

        display: grid;
        grid-template-rows: var(--expand-unit, 0fr);
        transition: grid-template-rows 0.2s ease-in-out;
        
        > .items {
          overflow: hidden;

          border: calc(var(--c-dropdown-expanded) * var(--header-border-size)) solid hsl(var(--hsl-primary-components));
          border-top-width: 0;
          background-color: hsl(var(--hsl-primary-components) / 0.1);
        }
      }

      &:hover {
        --expand-unit: 1fr;
        --c-dropdown-expanded: 1;
      }

      .items {
        > button {
          width: 100%;
        }
        > [role="separator"] {
          height: 1px;
          width: 80%;
          margin: 0.5rem auto;

          background-color: var(--neutral-800);
        }
      }
    }
  }

  > main {
    width: 100%;
    max-width: 660px;
    margin: 0 auto;

    overflow-y: auto;
    padding: 0 0.5rem 4rem;

    .story-title {
      font-size: 2rem;
      font-weight: 600;
      margin: 1em 0;
    }
  }

  .content-auto-layout {
    > *:not(:first-child) {
      margin-top: 1.5rem;
    }
  }
}

</style>
