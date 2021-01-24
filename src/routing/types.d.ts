import {RouteLocationNormalized} from "vue-router";

export type RouteTitleResolver = (to: RouteLocationNormalized) => string;
export type RouteTitle = string | RouteTitleResolver;
