import {defineComponent, h, inject} from "vue"
import {PlayerProgression} from "@src/modules/treasure-hunt/model/TreasureHuntModel"
import {RouterLink} from "vue-router"

export default defineComponent({
    props: {
        result: {type: Object, required: true},
    },

    setup(props) {
        const playerProgression = inject<PlayerProgression>('player.progression')

        return () => {
            const r = props.result
            if (r.unlockedProgression) {
                const storyPart = playerProgression.storyParts
                    .find((sp) => (sp as any)._id === r.unlockedProgression.storyPart)
                if (!storyPart) {
                    console.warn("No storyPart found for", r.unlockedProgression)
                    return

                }

                return h('div', [
                    "Pokračuj do ",
                    h(RouterLink, {to: {name: 'th.NodeView', params: {nodeId: storyPart.slug}}}, [
                        'další části příběhu'
                    ]),
                    '.',
                ])
            }

            if (r.template) {
                return renderTemplate(r.template)
            }

            console.warn("unknown reveal result", r)
        }
    },
})

const paramRegex = /"(?<text>[^"]+)":{(?<link>[\w\-:]+)}/
function renderTemplate(template: string) {
    let parts = []

    let match: RegExpMatchArray, rest = template
    while (match = paramRegex.exec(rest)) {
        parts.push(rest.substring(0, match.index))
        const to = parseLink(match.groups.link)
        const linkVNode = !to
            ? h('div', [match.groups.text])
            : h(RouterLink, {to}, [match.groups.text])
        parts.push(linkVNode)
        rest = rest.substring(match.index + match[0].length)
    }
    rest && parts.push(rest)

    return h('div', parts)
}
function parseLink(link: string) {
    const parts = link.split(':')
    if (parts[0] !== 'to' || parts[1] !== 'storyPart' || !parts[2]) {
        return null
    }
    return {name: 'th.NodeView', params: {nodeId: parts[2]}}
}
