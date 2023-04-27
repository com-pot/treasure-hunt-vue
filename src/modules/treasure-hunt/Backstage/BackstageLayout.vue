<template>
  <aside>
    <div class="brand">
      <div class="title">com-pot / treasure-hunt</div>
      <div class="subtitle">Zákulisí</div>
    </div>

    <hr/>

    <div class="btn-group story-picker" data-size="xs">
      <button class="btn" v-for="story in stories" :key="story.key"
              :class="storySelection.story === story.key && '-acc-primary'"
              @click="storySelection.story = story.key"
      >{{ story.title }}</button>
    </div>

    <hr/>

    <div class="user-panel">
      <template v-if="user.data">
        <span>{{ user.data.login }}</span>
        <button class="btn -sm" @click="user.actions.signOut()">Odhlásit se</button>
      </template>

      <template v-else>
        <router-link :to="logInTo" class="btn -sm">Přihlásit se</router-link>
      </template>
    </div>

    <hr/>

    <BackstageNavigation :items="navItems"/>
  </aside>

  <main :class="contentClass">
    <router-view/>
  </main>
</template>

<script lang="ts">
import {computed, ref} from "vue"
import {useRoute} from "vue-router"
import BackstageNavigation from "./components/BackstageNavigation.vue";
import useUser from "@src/modules/Auth/components/useUser"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import {NavigationItem} from "@src/modules/treasure-hunt/Backstage/navigation/NavigationModel"

export default {
  components: {
    BackstageNavigation,
  },

  setup() {
    const user = useUser()
    const route = useRoute()
    const storySelection = useStorySelection()

    const stories = ref([
      // {key: 'sotw', title: "Spirit of the Wild"},
      // {key: 'vlm', title: "Viva la Mexico"},
      {key: 'fw', title: "FurrWorld"},
    ])

    const navItems = computed(() => {
      const items: NavigationItem[] = [
        {to: {name: 'Backstage.SeasonDashboard'}, caption: 'Přehled', exact: true},
      ]
      if (user.data) {
        items.push(
            {to: {name: 'Backstage.Players'}, caption: "Hráči"},
            {to: {name: 'Backstage.Challenges'}, caption: "Výzvy"},
            {type: 'separator'},
            {to: {name: 'Backstage.ClueEditor'}, caption: "Stopy"},
            {to: {name: 'Backstage.StoryEditor'}, caption: "Editor příběhů"},
        )
      }

      items.push(
          {type: 'separator'},
          {to: {name: 'minigame.dev.index'}, caption: "Minihry"},
      )
      return items
    })

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
      }
    })

    return {
      stories,
      storySelection,

      contentClass,
      navItems,
      user,

      logInTo,
    }
  },
}
</script>

<style lang="scss">
[data-layout="backstage"] {
  min-height: 100vh;
  display: flex;

  --aside-width: 15rem;

  .backstage-nav {
    width: var(--aside-width);
  }

  > aside {
    position: sticky;
    top: 0; left: 0;
    height: 100vh;

    .brand {
      .title {
        font-size: 1.2rem;
        font-weight: 600;
      }

    }
    padding: 0.5rem;
  }

  > main {
    width: calc(100% - var(--aside-width));
    overflow-x: auto;
    padding: 0 0.5rem 4rem;

    .story-title {
      font-size: 2rem;
      font-weight: 600;
      margin: 1em 0;
    }
  }

  .story-picker {
    font-size: 0.75rem;
  }

  .content-auto-layout {
    > *:not(:first-child) {
      margin-top: 1.5rem;
    }
  }
}

.backstage-nav {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 0.5rem;

  overflow-y: auto;

  hr {
    width: 69%;
  }
}

</style>
