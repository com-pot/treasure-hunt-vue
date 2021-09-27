<template>
  <div class="sotw-landing">
    <p>
      Vítejte ve hře <b>Spirit of the Wild</b>. Pro pokračování prosím použijte jeden z následujících formulářů:
    </p>

    <div class="sign-options" v-if="user">
      <router-link class="option-link -resume-game" :to="{name: 'sotw.Game'}">
        <span class="user">{{user.login}}</span>
        <div class="description">Pokračujte zpět do hry</div>
      </router-link>
    </div>

    <div class="sign-options" v-else>
      <router-link class="option-link -form" :to="{name: 'Authorization', params: {formId: 'TZ-017-U'}}">
        <span class="title">Uvítací formulář</span>
        <span class="code">TZ-017-U</span>
        <span class="description">Formulář je určen pro zájemce o vstup do hry</span>
      </router-link>

      <router-link class="option-link -form" :to="{name: 'Authorization', params: {formId: 'TZ-017-N'}}">
        <span class="title">Návratový formulář</span>
        <span class="code">TZ-017-N</span>
        <span class="description">Formulář je určen pro stávající členy hry</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";

import authStore from "@/modules/Auth/authStore";
import {useTextsService} from "@/modules/SotW/services"

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
}
</style>
