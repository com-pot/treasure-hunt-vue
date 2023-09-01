<script lang="ts" setup>
import {computed, ref} from "vue"
import {useRoute} from "vue-router"

import useUser from "@src/modules/Auth/components/useUser"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import DialogStack from "@src/modules/Layout/components/DialogStack.vue"

const user = useUser()
const route = useRoute()
const storySelection = useStorySelection()

const stories = ref([
  // {key: 'sotw', title: "Spirit of the Wild"},
  // {key: 'vlm', title: "Viva la Mexico"},
  {key: 'fw', title: "FurrWorld"},
])

const modules = [
  {
    caption: "treasure-hunt",
    to: "/backstage ",
  },
  {
    caption: "Minihry",
    to: {name: 'minigame.dev.index'},
  },
  {
    caption: "Data",
    to: {name: "Typeful.ModelIndex"},
  },
]

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
    <router-link class="brand chip" :to="{name: 'Backstage.SeasonDashboard'}">
      <div class="title">com-pot</div>
      <div class="subtitle">Zákulisí</div>
    </router-link>

    <nav>
      <template v-for="mod of modules">
        <router-link class="item" :to="mod.to">
          <span>{{ mod.caption }}</span>
        </router-link>
      </template>
    </nav>


    <div class="user-panel" v-if="!user.data?.login">
      <router-link :to="logInTo" class="btn -sm">Přihlásit se</router-link>
    </div>

    <div class="user-panel dropdown" v-else>
      <div class="chip user-frame">
        <span class="login">{{ user.initials }}</span>
      </div>

      <div class="dropdown-container">
        <div class="items">
          <div>{{ user.data.login }}</div>
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

  <DialogStack/>
</template>

<style lang="scss">
[data-layout="backstage"] {
  min-height: 100vh;

  header {
    --header-padding: 0.5rem;
    --header-height: 3rem;
    --header-border-size: 0px;
    width: 100%;
    height: var(--header-height);
    padding: var(--header-padding);
    
    
    background: linear-gradient(
      to bottom,
      hsl(var(--hsl-primary-components) / 0.25) 0%,
      hsl(var(--hsl-primary-components) / 0.25) 40%,
      hsl(var(--hsl-primary-components) / 0.05) 80%,
      transparent 100%,
    );

    display: flex;
    align-items: center;
    gap: 1rem;

    .brand {
      padding: 0rem 0.3rem;
      color: black;
      background-color: var(--neutral-1000);
      text-decoration: none;
      border-radius: .5rem;

      .title {
        font-size: 1.2rem;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    nav {
      display: flex;
      height: 100%;
      gap: 0.5rem;

      > a {
        padding: 0 0.5rem;
        display: grid;
        place-content: center;

        text-decoration: none;
        
        color: var(--neutral-100);

        &.active {
          span {
            text-decoration: underline solid 2px var(--hsl-primary);
          }
        }
      }
    }

    .user-panel {
      margin-inline-start: auto;

      display: grid;
      place-content: center;
    }

    .chip {
      border-radius: 0.5rem;
      background-color: var(--neutral-1000);
      border: 1px solid var(--neutral-100);
    }

    .user-frame {
        width: 2.5rem;
        height: 2.5rem;

        display: grid;
        place-items: center;
      }

    .dropdown {
      --c-dropdown-expanded: 0;
      position: relative;
      align-self: stretch;

      transition: --c-dropdown-expanded 0.2s ease-in-out;

      .dropdown-container {
        position: absolute;
        top: calc(100% + var(--header-padding) + var(--header-border-size));
        right: 0;

        width: min(24ch, 80vw);

        display: grid;
        grid-template-rows: var(--expand-unit, 0fr);
        transition: grid-template-rows 0.2s ease-in-out;
        
        > .items {
          padding: calc(var(--c-dropdown-expanded) * 0.25rem) 0.25rem;
          border-top: calc(var(--c-dropdown-expanded) * 1px) solid var(--hsl-primary);
          backdrop-filter: blur(20px);
          overflow: hidden;

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

@property --c-dropdown-expanded {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

</style>
