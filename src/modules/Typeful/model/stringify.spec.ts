import {test, expect} from "vitest"
import {stringify} from "@src/modules/Typeful/model/stringify"

const item = {
    name: 'John',
    age: 17,
    buffed: true,
    weapon: {class: 'hammer'},
    hat: null,
}
const cases: [string, any][] = [
    ['name', 'John'],
    ['age', '17'],
    ['buffed', 'true'],
    ['weapon', '{"class":"hammer"}'],
    ['hat', ''],
    ['what', undefined],
]

cases.forEach(([prop, expectedResult]) => {
    test (`stringify spec 'prop=${prop}', expected=${expectedResult}`, function () {
        expect(stringify(item, prop)).to.equal(expectedResult)
    })
})

const templateCases = cases
    .map(([prop, expectedResult]) => {
        const template = `[{{${prop}}}]`
        if (prop === 'what') {
            return [template, '[---]']
        }

        return [template, `[${expectedResult}]`]
    })
templateCases.push([
    '{{ name}} ({{age }}) wielding {{ weapon }}', 'John (17) wielding {"class":"hammer"}',
])

templateCases.forEach(([template, expectedResult]) => {
    test (`stringify spec 'template=${template}', expected=${expectedResult}`, function () {
        expect(stringify(item, {template})).to.equal(expectedResult)
    })
})
