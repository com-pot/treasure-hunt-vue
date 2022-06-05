<template>
  <div class="th-landing">
    <p>Vítejte ve hře <b>{{ gameStatic.title }}</b></p>

    <p v-if="gameStatic.intro" v-html="gameStatic.intro"/>

    <div class="sign-options -authenticated" v-if="user.data">
      <p>Vítej zpět, <span class="user">{{ user.data.login }}</span>.</p>
      <router-link class="option-link -resume-game" :to="{name: 'th.Game'}">Pokračuj do hry</router-link>
      <button class="button-link -resume-game" @click.prevent="user.actions.signOut()">Odhlásit se</button>
    </div>

    <div class="sign-options" v-else>
      Pro pokračování prosím použijte jeden z následujících formulářů:

      <router-link class="option-link -form" :to="{name: 'Authorization', params: {formId: 'TZ-017-U'}}">
        <span class="title">Registrační formuláŕ</span>
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
import {defineComponent, inject} from "vue";

import useUser from "@src/modules/Auth/components/useUser"
import useGameStaticData from "@src/modules/treasure-hunt/components/useGameStaticData"

export default defineComponent({
  setup() {
    const user = useUser()
    const gameStatic = useGameStaticData()

    return {
      user,
      gameStatic,
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
