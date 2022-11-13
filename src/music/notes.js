export const ALTERNATIVE_NOTE_NAMES = (()=>{
    const greekAlphabet = 'αβγδεζηθικλμνξοπρςτυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split('')
    return [...greekAlphabet, ...greekAlphabet.map((value)=>`${value}'`)]
})()


export const PIANO_KEYS = (()=>{
    const from = 440
    const min = -5
    const zeroOctave = -5
    const max = 5
    const names = ["a","a#","b","c","c#","d","d#","e","f","f#","g","g#"]
    const colors = [0,1,0,0,1,0,1,0,0,1,0,1]
    const octaveOffset = 9
    let arr = []
    for (let octave = min; octave < max; octave++) {
        let base = from * Math.pow(2, octave)
        for (let note = 0; note < 12; note++) {
            arr.push({
                frequency: base * Math.pow(2, note/12), 
                note: names[note], 
                octave: Math.round(((octave-zeroOctave)*12+note-octaveOffset)/12),
                color: colors[note]
            })
        }
    }
    return arr
})()



export const OCTAVES = (()=>{
    const octaves = []
    let last = null
    PIANO_KEYS.forEach(key=>{
        if (key.octave !== last) {
            octaves.push(key)
            last = key.octave
        }
    })
    return octaves
})()

export const FREQUENCY_MAP = (()=>{
    const map = new Map()
    PIANO_KEYS.forEach(key=>{
        map.set(Math.round(key.frequency*100)/100, key)
    })
    return map
})()

export function getOctave(frequency) {
    if (frequency < OCTAVES[0].frequency) return null
    for (let i = 0; i<OCTAVES.length; i++) {
        if (frequency <= OCTAVES[i].frequency) return OCTAVES[i].octave - 1
    }
    return null
}

export function getNote(frequency) {
    const rounded = Math.round(frequency*100)/100
    if (FREQUENCY_MAP.has(rounded)) return {...FREQUENCY_MAP.get(rounded)}
    else return {
        frequency,
        note: null,
        octave: null,
        color: null,
        note: null
    }

}