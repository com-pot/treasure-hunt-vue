<template>
  <h1>Zákulisí</h1>
  <div class="backstage-nav">
    <router-link :to="{name: 'Backstage.Players'}" class="btn" active-class="btn-vivid">Hráči</router-link>
    <router-link :to="{name: 'Backstage.Challenges'}" class="btn" active-class="btn-vivid">Výzvy</router-link>
    <router-link :to="{name: 'Backstage.StoryEditor'}" class="btn" active-class="btn-vivid">Editor příběhů</router-link>
  </div>
</template>

<script>
export default {

}
</script>
