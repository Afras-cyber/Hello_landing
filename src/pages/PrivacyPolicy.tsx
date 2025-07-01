import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Tietosuoja - Blondify</title>
        <meta name="description" content="Blondifyn tietosuojakäytännöt ja henkilötietojen käsittely." />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative h-[30vh] bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">Tietosuoja</h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
                Henkilötietojen käsittely ja tietosuojakäytännöt
              </p>
            </div>
          </div>
        </div>

        <div className="blondify-container py-16">
          <div className="max-w-4xl mx-auto prose prose-lg prose-invert">
            <h2 className="text-2xl font-bold mb-6 font-redhat text-white">Tietosuojaseloste</h2>
            
            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">1. Rekisterinpitäjä</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Blondify Oy<br />
                Y-tunnus: 3381372-9<br />
                Maarinrannantie 4 A 803, 02130 Espoo<br />
                Sähköposti: vilma@blondify.fi
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">2. Yhteyshenkilö tietosuoja-asioissa</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Sähköposti: vilma@blondify.fi
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">3. Rekisterin nimi</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Blondifyn asiakasrekisteri ja verkkosivujen käyttäjärekisteri
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">4. Käsittelyn tarkoitus</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Henkilötietoja käsitellään seuraaviin tarkoituksiin:
              </p>
              <ul className="text-gray-300 font-redhat mb-4 list-disc pl-6">
                <li>Ajanvarausten käsittely ja asiakaspalvelu</li>
                <li>Markkinointiviestintä (suostumuksen perusteella)</li>
                <li>Verkkosivujen toiminnallisuuden tarjoaminen</li>
                <li>Tilastollinen analyysi ja palvelujen kehittäminen</li>
                <li>Asiakassuhteen hoitaminen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">5. Rekisterin tietosisältö</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Rekisteriin tallennettavia tietoja:
              </p>
              <ul className="text-gray-300 font-redhat mb-4 list-disc pl-6">
                <li>Nimi</li>
                <li>Yhteystiedot (sähköposti, puhelinnumero)</li>
                <li>Ajanvaraus- ja palvelutiedot</li>
                <li>Asiakashistoria</li>
                <li>Verkkosivujen käyttötiedot (evästeet, IP-osoite)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">6. Säännönmukaiset tietolähteet</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Tiedot saadaan asiakkaalta itseltään verkkosivujen kautta, ajanvarauksessa, asiakaspalvelutilanteissa sekä muussa asiointitapahtumassa.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">7. Tietojen säilytysaika</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Henkilötietoja säilytetään vain niin kauan kuin se on tarpeellista käsittelyn tarkoitusten toteuttamista varten tai lakisääteisten velvoitteiden täyttämiseksi.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">8. Rekisteröidyn oikeudet</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Sinulla on oikeus:
              </p>
              <ul className="text-gray-300 font-redhat mb-4 list-disc pl-6">
                <li>Tarkastaa sinua koskevat tiedot</li>
                <li>Oikaista virheelliset tiedot</li>
                <li>Poistaa tietosi tietyissä tilanteissa</li>
                <li>Vastustaa käsittelyä</li>
                <li>Siirtää tietosi toiseen järjestelmään</li>
                <li>Tehdä valitus valvontaviranomaiselle</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">9. Evästeet</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Verkkosivuillamme käytetään evästeitä käyttökokemuksen parantamiseksi ja analytiikkatarkoituksiin. Voit hallita evästeiden käyttöä selaimesi asetuksista.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">10. Yhteystiedot</h3>
              <p className="text-gray-300 font-redhat mb-4">
                Tietosuojaan liittyvissä kysymyksissä voit ottaa yhteyttä sähköpostitse osoitteeseen vilma@blondify.fi
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
