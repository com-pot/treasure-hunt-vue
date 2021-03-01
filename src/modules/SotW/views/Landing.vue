<template>
  <div class="sotw-landing">
    <p>
      Vítejte, vítejte, vítejte. Jmenuji se {{ replaceTerm('characters.guide.name') }}.<br>
      Jménem společnosti <b>{{ replaceTerm('company.casino.name') }}</b> vás vítám na této posvátné půdě.
    </p>
    <p v-if="!user">
      Jste tu poprvé anebo se vracíte? Tak či onak se zdá, že nemáte návštěvnickou visačku.
      Novou vám rádi vydáme až vyplníte <router-link :to="{name: 'Authorization', params: {formId: 'TZ-017-U'}}"><b>Uvítací formulář</b> TZ-017-U</router-link>
      anebo <router-link :to="{name: 'Authorization', params: {formId: 'TZ-017-N'}}"><b>Návratový formulář</b> TZ-017-N</router-link>.
    </p>
    <p v-else>
      Heleďme se, {{user.login}}.
      Tady vás již nic nečeká, pokračujte prosím <router-link :to="{name: 'sotw.Game'}">dále</router-link>.
    </p>
    <p>
      Tak šup šup, ať už se můžeme pohnout dál, za zážitkem vašeho života!
    </p>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";
import container from "../serviceContainer"
import TextsService from "@/modules/SotW/services/TextsService";
import authStore from "@/modules/Auth/authStore";

export default defineComponent({
  setup() {
    const textsService = container.getService<TextsService>('textsService');
    const user = computed(() => authStore.state.user.value)

    return {
      user,
      replaceTerm: (term: string) => textsService.replaceTerm(term),
    };
  },
})
</script>
