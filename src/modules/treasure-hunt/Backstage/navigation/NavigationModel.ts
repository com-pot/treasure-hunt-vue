import {RouteLocationRaw} from "vue-router"

export type SeparatorItem = {type: 'separator'}
export type LinkItem = {to: RouteLocationRaw, caption: string, exact?: boolean}

export type NavigationItem = LinkItem | SeparatorItem

export const navItemIsLink = (item: unknown): item is LinkItem => item && typeof item === 'object' && 'to' in item
