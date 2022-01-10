const logger = require('./logger')

function hexDoBin (hex) {
  return parseInt(hex, 16).toString(2).padStart(8, '0')
}

function binDoHex (binary) {
  return parseInt(binary, 2).toString(16).toLocaleUpperCase()
}

function chunkString (str, length) {
  return str.match(new RegExp(`.{1,${length}}`, 'g'))
}

function hexDo8Bit (klucz) {
  return chunkString(klucz, 2).map((hex) => hexDoBin(hex)).join('')
}

// Przesunięcie w lewo przestawiający najstarszy bit na pozycję najmłodszego
function przesuńWLewo (str) {
  return str.slice(1, str.length) + str.slice(0, 1)
}

function stringXOR (str1, str2, długość) {
  const xor = Array(długość)

  for (let i = 0; i < długość; i += 1) {
    xor[i] = (str1[i] === str2[i] ? 0 : 1)
  }

  return xor.join('')
}

// S-Box
// f1(x1,x2,x3,x4) = x1 ⊕ x1x3 ⊕  x2x4 ⊕x2x3x4 ⊕ x1x2x3x4 ⊕ k1
// f2(x1,x2,x3,x4) = x2 ⊕ x1x3 ⊕ x1x2x4 ⊕ x1x3x4 ⊕ x1x2x3x4 ⊕ k2
// f3(x1,x2,x3,x4) = 1 ⊕ x3 ⊕ x1x4 ⊕ x1x2x4 ⊕ x1x2x3x4 ⊕ k3
// f4(x1,x2,x3,x4) = 1 ⊕ x1x2 ⊕ x3x4 ⊕ x1x2x4 ⊕ x1x3x4 ⊕ x1x2x3x4 ⊕ k4
const SBox = [
  (x1, x2, x3, x4, k1) => x1 ^ x1 & x3 ^ x2 & x4 ^ x2 & x3 & x4 ^ x1 & x2 & x3 & x4 ^ k1,
  (x1, x2, x3, x4, k2) => x2 ^ x1 & x3 ^ x2 & x4 ^ x1 & x3 & x4 ^ x1 & x2 & x3 & x4 ^ k2,
  (x1, x2, x3, x4, k3) => 1 ^ x3 ^ x1 & x4 ^ x1 & x2 & x4 ^ x1 & x2 & x3 & x4 ^ k3,
  (x1, x2, x3, x4, k4) => 1 ^ x1 & x2 ^ x3 & x4 ^ x1 & x2 & x4 ^ x1 & x3 & x4 ^ x1 & x2 & x3 & x4 ^ k4
]

// Funkcja konwertująca 4 bity danych szyfrowanych oraz klucz rundowy, które są
// przekazywane do funkcji stanowiących S-Box w odpowiednich typach danych
function SBoxOut (tekst, kluczRundowy) {
  return SBox[0](parseInt(tekst[0], 2), parseInt(tekst[1], 2), parseInt(tekst[2], 2), parseInt(tekst[4], 2), parseInt(kluczRundowy[0], 2)).toString(2) +
    SBox[1](parseInt(tekst[0], 2), parseInt(tekst[1], 2), parseInt(tekst[2], 2), parseInt(tekst[4], 2), parseInt(kluczRundowy[1], 2)).toString(2) +
    SBox[2](parseInt(tekst[0], 2), parseInt(tekst[1], 2), parseInt(tekst[2], 2), parseInt(tekst[4], 2), parseInt(kluczRundowy[2], 2)).toString(2) +
    SBox[3](parseInt(tekst[0], 2), parseInt(tekst[1], 2), parseInt(tekst[2], 2), parseInt(tekst[4], 2), parseInt(kluczRundowy[3], 2)).toString(2)
}

// Wybór bitów klucza k1, k3, k5, k7
function wybor (klucz) {
  return klucz[0] + klucz[2] + klucz[4] + klucz[6]
}

// Generowanie ośmiu kluczy rundowych
function generujKluczeRundowe (klucz) {
  const kluczeRundowe = []

  let poprzedniKlucz = klucz

  for (let i = 0; i < 8; i += 1) {
    if (i % 2 === 0) {
      const chunki = chunkString(poprzedniKlucz, 4)

      chunki[0] = przesuńWLewo(chunki[0])
      chunki[1] = przesuńWLewo(chunki[1])

      poprzedniKlucz = chunki[0] + chunki[1]
    } else {
      poprzedniKlucz = przesuńWLewo(poprzedniKlucz)
    }

    kluczeRundowe.push(wybor(poprzedniKlucz))
  }

  return kluczeRundowe
}

// Szyfrowanie przebiega w ośmiu rundach
function szyfr (tekst, kluczeRundowe) {
  const podzielonyTekst = chunkString(tekst, 4)

  let prawa = podzielonyTekst[0]
  let lewa = podzielonyTekst[1]
  let temp = ''
  let runda = 0

  for (const kluczRundowy of kluczeRundowe) {
    temp = prawa

    const wynikSBox = SBoxOut(prawa, kluczRundowy)
    prawa = stringXOR(wynikSBox, lewa, 4)
    lewa = temp

    logger.debug(`Runda ${++runda}: L: ${lewa}, P: ${prawa}, Klucz: ${kluczRundowy}`)
  }

  logger.debug('')

  const wynik = lewa + prawa

  return chunkString(wynik, 4).map(binDoHex).join('').toUpperCase()
}

function szyfruj (tekst, klucz) {
  return szyfr(tekst, generujKluczeRundowe(klucz))
}

// Deszyfracja polega na szyfryzacji danych tym samym algorytmem szyfrowanie ale
// z kluczami podanymi w odwrotnej kolejności. Zgodnie z siecią Feistela.
function deszyfruj (tekst, klucz) {
  return szyfr(tekst, generujKluczeRundowe(klucz).reverse())
}

module.exports = {
  szyfruj,
  deszyfruj,
  hexDo8Bit
}
