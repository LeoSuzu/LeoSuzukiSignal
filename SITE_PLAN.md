# Leo Suzuki Signal — uuden CV-sivuston suunnitelma

Tätä tiedostoa luetaan aina ensimmäisenä, kun uuden sivuston työstämistä jatketaan. Sivusto on erillinen vanhasta `MyCVSite`-kansiosta ja julkaistaan myöhemmin omana GitHub Pages -projektinaan.

## Tavoite

Rakennetaan Leo Suzukin englanninkielinen portfolio-CV, joka kertoo nopeasti kuka Leo on, mitä hän osaa ja millaisia projekteja hän on tehnyt. Sivuston tunnelma on tumma, tekninen ja rauhallinen: käyttöliittymä muistuttaa keskusteluikkunaa ja tutkimusnäkymää, mutta siinä ei käytetä avaruusaluksia, lentokoneita, planeettoja, UFOja tai muuta avaruus-/lentoteemaa.

## Sivun järjestys

1. **Landing / Who am I** — nimi, rooli, lyhyt esittely, saatavuus, yhteydenotto ja CV.
2. **Education** — TAMK:n insinööritutkinto sekä TPA/SASKY:n ICT-koulutus.
3. **Work experience** — Solita, Finn Teollisuuspalvelut, Beiz, Brunakärrs Energi ja Findaco.
4. **Skills** — ohjelmointi, web, Android, tietokannat, työkalut ja sertifikaatit.
5. **Projects / Portfolio** — potilasseuranta, Movesense, Android, Weather & Pic, DXF-laskenta, Art Maker Studio, Bitcoin-analyysi ja Arduino-pelikonsoli.
6. **Harrastukset / Outside the screen** — pyöräily, matkustaminen ja animen katsominen pojan kanssa.
7. **Contact** — selkeä viimeinen yhteydenottokutsu.

## Visuaalinen suunta

- Päätausta: lähes musta hiilenharmaa; pinnassa hienovarainen ruudukko ja kohina.
- Korostukset: hillitty syaani tiedolle ja lämmin meripihka aktiiviselle tilalle.
- Teksti: lämmin vaalea valkoinen, toissijainen teksti siniharmaa.
- Kulmat: pienet, terävät tai kevyesti leikatut kulmat; ei geneeristä pyöristettyä korttikirjastoa.
- Typografia: yksi persoonallinen display-fontti otsikoille ja monospace käyttöliittymän tilariveille.
- Inspiraatio: tummat dashboard-rakenteet, skanneriviivat, datakaaviot, terminal/chat-ikkunat ja kerroksittainen ruudukko.

## Pääinteraktio

Sivun oikeassa reunassa kulkee kiinteä chat-/terminal-ikkuna. Kun käyttäjä vierittää:

- aktiivinen osio päivittyy tekstiksi, esimerkiksi `> reading / education`;
- chatin viesti vaihtuu osion mukaan;
- pieni kaavio, mittari tai skanneri vaihtuu aiheen mukaan;
- osion etenemä näkyy pystysuuntaisessa navigaatiossa;
- navigaation painikkeet vievät suoraan kyseiseen osioon.

Chat-ikkuna on sisällöllisesti hyödyllinen: se tiivistää aina sen osion, jota käyttäjä katsoo. Se ei peitä pääsisältöä, ja mobiilissa se muuttuu alareunan leveäksi, helposti suljettavaksi tilapalkiksi.

## Animaatiot ja parallax

- Hidas taustaruudukon ja skannerin liike antaa sivulle syvyyttä.
- Kortit tulevat näkyviin kevyellä opacity/translate-animaatiolla.
- Kaaviot piirtyvät SVG-viivana, kun osio tulee näkyviin.
- Parallax toimii CSS-muuttujilla ja yhdellä `requestAnimationFrame`-kuuntelijalla, jotta suorituskyky säilyy hyvänä.
- `prefers-reduced-motion: reduce` poistaa jatkuvan liikkeen ja näyttää kaiken sisällön heti.

## Toteutusrakenne

- `index.html` — kaikki osiot, sisältö, saavutettavat navigointipainikkeet ja SVG-grafiikoiden rakenne.
- `style.css` — kaikki värit, typografia, mitoitus, responsiivisuus, kortit, chat-ikkuna, kaaviot ja animaatiot CSS-muuttujina.
- `script.js` — osion aktiivisuuden seuranta, chat-tilan vaihto, parallax, SVG-viivojen käynnistys ja projektikorttien avaus.
- `assets/` — vanhan sivuston CV, profiilikuvat ja projektikuvat/videoesikatselut.
- `README.md` — paikallinen käynnistys, GitHub Pages -julkaisu ja ylläpito-ohje.
- `.github/workflows/pages.yml` — automaattinen GitHub Pages -julkaisu `dist/`-kansiosta.

## Rajaukset

- Ei ulkoisia maksullisia assetteja.
- Pixabayta tai Uppbeatiä käytetään vain, jos tarvitaan ilmainen ja käyttöoikeuksiltaan sopiva taustaääni tai kuva; ensisijaisesti käytetään nykyisiä omia assetteja ja CSS/SVG-grafiikkaa.
- Ei frontend-frameworkia eikä raskasta animaatiokirjastoa.
- Kaikki helposti säädettävät arvot pidetään `style.css`:n `:root`-muuttujissa.
- Vanhaa `MyCVSite`-kansiota ei muokata uuden sivuston kehityksen aikana.

## Työvaiheet

1. Vaihda kopioitu lähtöpohja tähän osiojärjestykseen ja siisti sisältö vanhan CV:n tiedoista.
2. Rakenna terminal/chat-HUD, osion vaihtuvat kortit ja navigaatio.
3. Lisää SVG-kaaviot, skannerit ja parallax sekä mobiili- ja reduced-motion-polut.
4. Tarkista linkit, kuvat, videopolut, näppäimistökäyttö ja kontrastit.
5. Lisää GitHub Pages -build ja workflow.
6. Testaa paikallinen `dist/`-tuotos ennen erillistä julkaisemista.

## Jatkokomento

Kun tätä suunnitelmaa halutaan käyttää, pyydä: **"Lue LeoSuzukiSignal/SITE_PLAN.md ja jatka suunnitelman mukaan."**
