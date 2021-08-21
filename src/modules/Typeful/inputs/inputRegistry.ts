import type {Component} from "vue"
import {inject} from "vue";

export type InputComponent = Component;
export type InputRegistry = Map<string, InputComponent>

export const useInputRegistry = (): InputRegistry => inject('typeful.inputRegistry') as InputRegistry