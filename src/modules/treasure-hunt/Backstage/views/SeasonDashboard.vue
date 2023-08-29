<script lang="ts" setup>
import { computed } from 'vue';
import NavList from '@src/modules/Layout/components/NavList.vue';
import { NavigationItem } from "@src/modules/Layout/navigation/NavigationModel"

import useUser from "@src/modules/Auth/components/useUser"

const user = useUser()

const navItems = computed(() => {
  const items: NavigationItem[] = []

  if (user.data) {
    items.push(
        {to: {name: 'Backstage.Players'}, caption: "Hráči"},
        {to: {name: 'Backstage.Challenges'}, caption: "Výzvy"},
        {type: 'separator'},
        {to: {name: 'Backstage.ClueEditor'}, caption: "Stopy"},
        {to: {name: 'Backstage.StoryEditor'}, caption: "Editor příběhů"},
    )
  }
  
  return items
})

</script>

<template>
  <h1>Dashboard</h1>
  <p>Stats about current season's game: All's pending</p>

  <template v-if="user.data">
    <hr>
    <NavList :items="navItems"></NavList>
  </template>

  <template v-else>
    Commit a login!
  </template>
</template>
