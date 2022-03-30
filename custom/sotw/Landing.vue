<template>
  <div class="sotw-landing">
    <p>
      Vítejte ve hře <b>Stezka duchů / Spirit of the Wild</b>
    </p>

    <p>
      V rámci vaší návštěvy westernového světa mate jedinečnou možnost poodhalit tajemství kultury domorodého
      obyvatelstva. Cesty duchů jsou ovšem nevyzpytatelné a plné nejrůznějších úkladů.
      <br>
      Máte-li tedy odvahu vydat se na tuto cestu vězte, že není hambou poprosit o pomoc své strážné duchy v podobě
      přátel a dalších hráčů, neb temnota si na vás v stínech už brousí drápy.
    </p>

    <div class="sign-options -authenticated" v-if="user">
      <p>Vítej zpět, <span class="user">{{ user.login }}</span>.</p>
      <router-link class="option-link -resume-game" :to="{name: 'sotw.Game'}">Pokračuj do hry</router-link>
    </div>

    <div class="sign-options" v-else>
      Pro pokračování prosím použijte jeden z následujících formulářů:

      <router-link class="option-link -form" :to="{name: 'Authorization', params: {formId: 'TZ-017-U'}}">
        <span class="title">Uvítací formulář</span>
        <span class="code">TZ-017-U</span>
        <span class="description">Formulář je určen pro zájemce o vstup do hry</span>
      </router-link>

      <router-link class="option-link -form" :to="{name: 'Authorization', params: {formId: 'TZ-017-P'}}">
        <span class="title">Přihlašovací formulář</span>
        <span class="code">TZ-017-P</span>
        <span class="description">Formulář je určen pro stávající členy hry</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";

import authStore from "@src/modules/Auth/authStore";
import {useTextsService} from "@src/modules/treasure-hunt/services"

export default defineComponent({
  setup() {
    const textsService = useTextsService()
    const user = computed(() => authStore.state.user.value)

    return {
      user,
      replaceTerm: (term: string) => textsService.replaceTerm(term),
    };
  },
})
</script>

<style lang="scss">

.sign-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  margin-top: 4rem;
  margin-bottom: 2rem;

  .option-link {
    flex: 1 0 45%;
    display: flex;
    flex-direction: column;

    padding: 0.5rem;

    &.-form {
      background: lightpink;
      border: 2px solid darkgray;

      color: black;

      .title {
        font-weight: bold;
      }

      .code {
        font-size: 0.8rem;
      }

      .description {
        margin-top: 0.5rem;
        border-top: 1px solid darkgray;
        padding-top: 0.5rem;
      }
    }

    text-decoration: none;
  }

  &.-authenticated {
    flex-direction: column;

    p {
      margin: 0;
    }

    .-resume-game {
      align-self: center;
      display: block;
      background: var(--container-bg);
      border: var(--hsl-vile) 2px solid;
      color: var(--hsl-vile);
    }
  }
}
</style>
