<template>
  <div class="authorization-page">

    <component v-if="currentForm" :is="currentForm.component" :form-spec="currentForm.spec" @submitted="submitSignIn"/>

    <p v-else>Jejda</p>

    <router-link class="btn" :to="{name: 'Landing.welcome'}">Zpět</router-link>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";

import authStore from "../authStore";
import WelcomeForm from "../components/WelcomeForm.vue";
import {useRoute, useRouter} from "vue-router";
import {useAlert} from "@src/modules/Layout/components/viewUtils";

type AvailableForm = {
  spec: AuthForm,
  component: any,
};

const availableForms: AvailableForm[] = [
  {
    spec: {
      id: 'TZ-017-U', title: 'Uvítací formulář',
      description: 'Vyplněním unikátních údajů získáváte přístup do kůry "Na vlastní srst" která vás vezme do jiného světa.',
    },
    component: WelcomeForm,
  },
  {
    spec: {
      id: 'TZ-017-P', title: 'Návratový formulář',
      description: 'Vyplněním správných údajů získáte zpět přístup do kůry "Na vlastní srst".'
    },
    component: WelcomeForm,
  },
];


export default defineComponent({
  props: {
    formId: {type: String},
  },
  setup(props) {
    const $router = useRouter();
    const route = useRoute()
    const alert = useAlert()

    const currentForm = computed(() => {
      return availableForms.find((form) => form.spec.id === props.formId)
    });

    const commonLoginErrors: Record<string, string> = {
      'login-taken': "Jméno je již obsazené",
      'missing-credentials': "Neplatné přihlašovací údaje",
      'invalid-credentials': "Neplatné přihlašovací údaje",
    }

    function getContinueTo() {
      const continueName = route.query['return-to']
      let continueTo
      if (continueName && typeof continueName === 'string') {
        try {
          continueTo = $router.resolve({name: continueName})
        } catch (err) {
          console.error('Invalid return location', err)

        }
      }

      return continueTo || {name: 'th.Game'}
    }

    return {
      currentForm,
      submitSignIn: (authValues: { login: string, password: string }) => {
        const loginPromise = currentForm.value!.spec.id === 'TZ-017-P'
            ? authStore.actions.signIn(authValues.login, authValues.password)
            : authStore.actions.signUp(authValues.login, authValues.password);

        loginPromise
            .then(() => {
              $router.push(getContinueTo())
            })
            .catch((err) => {
              const error = err.body && err.body.error
              const text = commonLoginErrors[error] || "Neočekávaná chyba"

              alert.fire({
                toast: true,
                text: text,
                timer: 2000,
                didOpen(popup) {
                  popup.addEventListener('mouseenter', alert.stopTimer)
                  popup.addEventListener('mouseleave', alert.resumeTimer)
                }
              })
            })

      },
    };
  },
});

</script>

<style lang="scss">
.authorization-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;

  .btn {
    align-self: center;
  }
}
</style>
