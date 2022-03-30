interface SoundDefUninitialized {
    status: 'pending' | 'error',
    fileName: string,
}
interface SoundDefInitialized {
    status: 'ready',
    audio: HTMLAudioElement,
}
type SoundDef = SoundDefInitialized | SoundDefUninitialized

function soundIsInitialized(sound: SoundDef): sound is SoundDefInitialized {
    return sound.status === "ready";
}

type SoundBankSpec = { [soundName: string]: string }
type SoundBank = { [soundName: string]: SoundDef|SoundDefInitialized }

export default class AudioService {
    private readonly soundBank: SoundBank;
    private allLoaded: Promise<void> | null = null;

    constructor(soundBankSpec: SoundBankSpec, private readonly soundBankId: string) {
        this.soundBank = {};
        for (let [name, fileName] of Object.entries(soundBankSpec)) {
            this.soundBank[name] = {status: 'pending', fileName}
        }
    }

    public preloadFiles(): Promise<void> {
        if (this.allLoaded) {
            return this.allLoaded;
        }

        let soundBankElement = document.createElement('div')
        soundBankElement.classList.add('soundbank')
        soundBankElement.id = this.soundBankId

        let promises = Object.entries(this.soundBank)
            .map(([name, sound]) => new Promise<void>((resolve) => {
                let audioEl = document.createElement('audio')
                audioEl.src = (sound as SoundDefUninitialized).fileName
                audioEl.preload = "auto"
                audioEl.oncanplay = () => {
                    this.soundBank[name] = {
                        status: 'ready',
                        audio: audioEl,
                    }
                    resolve()
                }
                audioEl.onerror = () => {
                    sound.status = 'error';
                    console.warn("Failed to load audio file ", sound)
                    resolve()
                }
                soundBankElement.appendChild(audioEl)
            }))

        document.body.appendChild(soundBankElement)

        return this.allLoaded = Promise.all(promises)
            .then(() => {}) // prevent the promise from exposing results
    }

    public play(sound: string) {
        if (!(sound in this.soundBank)) {
            console.warn("Sound does not exist", sound);
            return
        }
        let soundObj = this.soundBank[sound];
        if (!soundIsInitialized(soundObj)) {
            console.warn("Sound is not ready", soundObj);
            return
        }
        let audioEl = soundObj.audio
        if (!audioEl.paused) {
            audioEl.pause()
            audioEl.currentTime = 0
        }
        soundObj.audio.play()
    }

}
