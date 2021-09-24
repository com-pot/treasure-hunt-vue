<template>
  <div class="authorization-page">

    <component v-if="currentForm" :is="currentForm.component" :form-spec="currentForm.spec" @submitted="submitSignIn"/>

    <p v-else>Jejda</p>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";

import authStore from "../authStore";
import WelcomeForm from "../components/WelcomeForm.vue";
import {useRouter} from "vue-router";

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
      id: 'TZ-017-N', title: 'Návratový formulář',
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

    const currentForm = computed(() => {
      return availableForms.find((form) => form.spec.id === props.formId)
    });

    return {
      currentForm,
      submitSignIn: (authValues: { login: string, password: string }) => {
        const loginPromise = currentForm.value!.spec.id === 'TZ-017-N'
            ? authStore.actions.signIn(authValues.login, authValues.password)
            : authStore.actions.signUp(authValues.login, authValues.password);

        loginPromise
            .then(() => {
              $router.push({name: 'sotw.Game'});
            })
            .catch((err) => {
              console.error(err);
            })

      },
    };
  },
});

</script>

<style lang="scss">
.sign-in {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>
