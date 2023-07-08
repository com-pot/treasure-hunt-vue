import { computed, reactive, ref } from "vue"
import VocabularyEntry from "./Model/VocabularyEntry"
import arrays from "@src/utils/arrays"

type UnderstandConfig = {
    wordsPerRound: number,
    optionsPerWord: number,
    stepTimeLimit: number,
}
export function useUnderstandController(config: UnderstandConfig, emit: Function) {
    const gameState = ref('idle' as "idle" | "started" | "failed" | "won")
    const vocabulary = ref([] as VocabularyEntry[])
    const round = reactive({
        currentStep: -1,
        wordIndices: [] as number[],
        currentWordIndex: -1,
        optionIndices: [] as number[],
    })
    const step = reactive({
        remainingTime: 0,
    })

    const currentWordIndex = computed((): number => {
        let number = round.wordIndices[round.currentStep]
        if (typeof number === "undefined") {
            number = round.wordIndices[round.currentStep - 1]
        }

        return number
    })
    const currentWord = computed((): VocabularyEntry => {
        return vocabulary.value[currentWordIndex.value];
    })
    const remainingTimePct = computed((): number => {
        return step.remainingTime / config.stepTimeLimit;
    })

    function updateTimeLimit(t: number, dt: number) {
        if (gameState.value !== 'started') return

        step.remainingTime -= dt * 0.001
        if (step.remainingTime <= 0) {
            step.remainingTime = 0
            endAttempt('failed')
        }
    }

    function startRound() {
        let indices = vocabulary.value.map((entry, i) => i) as number[]
        arrays.shuffleFisherYates(indices)
        round.wordIndices = indices.slice(0, config.wordsPerRound)
        round.currentStep = 0
        initializeOptions()
    }

    function initializeOptions() {
        if (!vocabulary.value?.length || round.currentStep === -1) {
            console.log("No updato");
            return;
        }

        let indices = vocabulary.value.map((entry, i) => i) as number[];
        let optionIndices = arrays.shuffleFisherYates(indices).slice(0, config.optionsPerWord);
        if (!optionIndices.includes(currentWordIndex.value)) {
            let i = Math.floor(Math.random() * optionIndices.length)
            optionIndices[i] = currentWordIndex.value
        }
        round.optionIndices = optionIndices
        step.remainingTime = config.stepTimeLimit
    }

    function selectOption(option: number) {
        if (option !== currentWordIndex.value) {
            endAttempt('failed')
            return
        }

        nextStep()
    }
    function nextStep() {
        round.currentStep++;
        if (round.currentStep === config.wordsPerRound) {
            endAttempt('won')
        } else {
            initializeOptions();
        }
    }
    function beginAttempt() {
        startRound()
        gameState.value = 'started'
    }
    function endAttempt(state: 'failed' | 'won') {
        gameState.value = state

        emit('check-solution', 777 * round.currentStep + 1847)
    }

    return {
        vocabulary,
        gameState,
        remainingTimePct,

        round,

        currentWord,
        
        updateTimeLimit,
        beginAttempt,
        selectOption,
    }
}
