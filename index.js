'use-strict'

const { szyfruj, deszyfruj, hexDo8Bit } = require('./blockCipher')

const zadania = [
  {
    tekst: '00',
    klucz: 'E0'
  },
  {
    tekst: '78',
    klucz: 'B1'
  },
  {
    tekst: 'FA',
    klucz: 'AC'
  }
]

for (const { klucz, tekst } of zadania) {
  const binarnyKlucz = hexDo8Bit(klucz)
  const binarnyTekst = hexDo8Bit(tekst)

  console.log(`Klucz: ${klucz}, ${binarnyKlucz}`)
  console.log(`Tekst: ${tekst}, ${binarnyTekst}`)

  console.log()

  console.log('Szyfrowanie:\n')

  const zaszyfrowanyTekst = szyfruj(binarnyTekst, binarnyKlucz)

  const binarnyZaszyfrowanyTekst = hexDo8Bit(zaszyfrowanyTekst)

  console.log(`Zaszyfrowane dane: ${zaszyfrowanyTekst}, ${binarnyZaszyfrowanyTekst}\n`)

  console.log('Odszyfrowywanie:\n')

  const odszyfrowaneDane = deszyfruj(binarnyZaszyfrowanyTekst, binarnyKlucz)

  console.log(`Odszyfrowane dane: ${odszyfrowaneDane}, ${hexDo8Bit(odszyfrowaneDane)}\n`)
}
