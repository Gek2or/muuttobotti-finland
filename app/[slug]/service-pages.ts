export type ServicePage = {
  title: string;
  eyebrow: string;
  description: string;
  bullets: string[];
  serviceName?: string;
  area?: string;
  faq?: [string, string][];
  legal?: boolean;
};

const movingFaq = (area: string): [string, string][] => [
  ["Miten muuton hinta määräytyy?", "Hinta perustuu työaikaan, muuttajien määrään, etäisyyteen ja mahdollisiin lisäpalveluihin. Saat arvion laskurista ja vahvistuksen ennen työn alkua."],
  ["Milloin työaika alkaa?", "Työaika alkaa, kun tiimi saapuu sovittuun nouto-osoitteeseen."],
  ["Voiko muuton varata samalle päivälle?", `Kyllä, ${area} saman päivän muutto onnistuu vapaan kapasiteetin mukaan.`],
];

const cleaningFaq = (area: string): [string, string][] => [
  ["Tuotteko siivousvälineet mukana?", "Kyllä, tavalliset ammattivälineet ja siivousaineet voidaan sisällyttää palveluun."],
  ["Voiko siivouksen yhdistää muuttoon?", "Kyllä. Muutto ja muuttosiivous voidaan sopia samaan tilaukseen, jolloin aikataulu pysyy yhden tiimin hallinnassa."],
  ["Kuinka kauan siivous kestää?", `Kesto riippuu asunnon koosta ja kunnosta. ${area} saat arvion jo ennen varausta.`],
];

export const servicePages: Record<string, ServicePage> = {
  "moving-helsinki": {
    title: "Muuttopalvelu Helsinki",
    eyebrow: "Luotettava muutto Helsingissä",
    description: "Sujuva koti- tai yritysmuutto Helsingissä. Iso 13–15 m³ pakettiauto, joustava tiimi ja selkeä hinnoittelu ilman turhaa säätöä.",
    bullets: ["Koti- ja toimistomuutot", "Pakkaus ja kalusteasennus", "Nopea verkkovaraus ja seurantalinkki"],
    serviceName: "Muuttopalvelu",
    area: "Helsinki",
    faq: movingFaq("Helsingissä"),
  },
  "moving-espoo": {
    title: "Muuttopalvelu Espoo",
    eyebrow: "Muutot kaikkialla Espoossa",
    description: "Turvallinen muuttopalvelu Espoossa Tapiolasta Matinkylään, Leppävaaraan ja koko pääkaupunkiseudulle.",
    bullets: ["1 tai 2 muuttajaa tarpeen mukaan", "Iso 13–15 m³ pakettiauto", "Siivous samassa varauksessa"],
    serviceName: "Muuttopalvelu",
    area: "Espoo",
    faq: movingFaq("Espoossa"),
  },
  "moving-vantaa": {
    title: "Muuttopalvelu Vantaa",
    eyebrow: "Helppo muutto Vantaalla",
    description: "Koti-, yritys- ja pienmuutot Vantaalla selkeällä aikataululla. Hoidamme myös huonekalut, kodinkoneet ja erilliset kuljetukset.",
    bullets: ["Selkeä tuntihinnoittelu", "Kodinkoneiden ja huonekalujen kuljetus", "Samana päivänä saatavuuden mukaan"],
    serviceName: "Muuttopalvelu",
    area: "Vantaa",
    faq: movingFaq("Vantaalla"),
  },
  "moving-tuusula": {
    title: "Muuttopalvelu Tuusula",
    eyebrow: "Paikallinen tiimi Tuusulassa",
    description: "Nopea muutto- ja kuljetuspalvelu Hyrylässä, Jokelassa, Kellokoskella ja lähialueilla. Sopii sekä kokonaisiin muuttoihin että yksittäisiin kuljetuksiin.",
    bullets: ["Paikallinen ja joustava palvelu", "Ei piilokuluja vahvistetussa tarjouksessa", "Muutto ja loppusiivous samalla tilauksella"],
    serviceName: "Muuttopalvelu",
    area: "Tuusula",
    faq: movingFaq("Tuusulassa"),
  },
  "moving-kerava": {
    title: "Muuttopalvelu Kerava",
    eyebrow: "Muutot Keravalla",
    description: "Luotettava muutto Keravalla, Uudellamaalla ja tarvittaessa koko Suomessa. Työ voidaan mitoittaa yhdelle tai kahdelle muuttajalle.",
    bullets: ["Asunnot ja omakotitalot", "Huonekalujen purku ja kokoaminen", "Kierrätys- ja poisvientikuljetukset"],
    serviceName: "Muuttopalvelu",
    area: "Kerava",
    faq: movingFaq("Keravalla"),
  },
  "moving-jarvenpaa": {
    title: "Muuttopalvelu Järvenpää",
    eyebrow: "Muutto ilman turhaa stressiä",
    description: "Huolellinen muuttopalvelu Järvenpäässä selkeällä hinnalla, isolla pakettiautolla ja joustavalla aikataululla.",
    bullets: ["13–15 m³ pakettiauto", "Pakkausapu ja kalusteasennus", "Varausnumero ja yksityinen seurantalinkki"],
    serviceName: "Muuttopalvelu",
    area: "Järvenpää",
    faq: movingFaq("Järvenpäässä"),
  },
  "moving-hyvinkaa": {
    title: "Muuttopalvelu Hyvinkää",
    eyebrow: "Uusimaa ja koko Suomi",
    description: "Kodin ja yrityksen muutot Hyvinkäällä. Suunnittelemme reitin, tiimin ja työmäärän etukäteen myös pidemmille muuttomatkoille.",
    bullets: ["Pitkän matkan muutot", "Yritysmuutot", "Kalusteiden purku ja asennus"],
    serviceName: "Muuttopalvelu",
    area: "Hyvinkää",
    faq: movingFaq("Hyvinkäällä"),
  },
  "moving-porvoo": {
    title: "Muuttopalvelu Porvoo",
    eyebrow: "Muutot Porvoossa",
    description: "Huolellinen muutto Porvoossa ja Uudellamaalla. Palvelu sopii pienmuuttoihin, kokonaisiin kotimuuttoihin ja yksittäisiin kuljetuksiin.",
    bullets: ["Koti- ja pienmuutot", "Kuljetus ja kantoapu", "Muuttosiivous samassa tilauksessa"],
    serviceName: "Muuttopalvelu",
    area: "Porvoo",
    faq: movingFaq("Porvoossa"),
  },
  "cleaning-helsinki": {
    title: "Siivouspalvelu Helsinki",
    eyebrow: "Raikas koti, vähemmän vaivaa",
    description: "Koti-, toimisto- ja muuttosiivoukset Helsingissä ammattivälineillä ja sovitulla tarkistuslistalla.",
    bullets: ["Muuttosiivous", "Koti- ja toimistosiivous", "Ikkunanpesu lisäpalveluna"],
    serviceName: "Siivouspalvelu",
    area: "Helsinki",
    faq: cleaningFaq("Helsingissä"),
  },
  "cleaning-espoo": {
    title: "Siivouspalvelu Espoo",
    eyebrow: "Ammattisiivous Espoossa",
    description: "Huolellinen koti- ja muuttosiivous Espoossa juuri sinun aikatauluusi. Palvelu voidaan yhdistää muuttoon yhdellä varauksella.",
    bullets: ["Aineet ja välineet saatavilla", "Ikkunanpesu", "Muuttosiivous"],
    serviceName: "Siivouspalvelu",
    area: "Espoo",
    faq: cleaningFaq("Espoossa"),
  },
  "cleaning-vantaa": {
    title: "Siivouspalvelu Vantaa",
    eyebrow: "Puhdasta jälkeä Vantaalla",
    description: "Tehokas siivouspalvelu kodeille, toimistoille ja lyhytaikaisvuokrauksen kohteille Vantaalla.",
    bullets: ["Koti- ja toimistosiivous", "Vaihto- ja ylläpitosiivous", "Muuttosiivous"],
    serviceName: "Siivouspalvelu",
    area: "Vantaa",
    faq: cleaningFaq("Vantaalla"),
  },
  "window-cleaning-helsinki": {
    title: "Ikkunanpesu Helsinki",
    eyebrow: "Kirkkaat ikkunat ilman raitoja",
    description: "Ikkunat, karmit ja parvekelasit puhtaaksi Helsingissä turvallisesti ammattivälineillä.",
    bullets: ["Kotien ja toimistojen ikkunat", "Parvekelasit", "Karmien puhdistus"],
    serviceName: "Ikkunanpesu",
    area: "Helsinki",
    faq: [["Pesettekö myös parvekelasit?", "Kyllä, parvekelasit voidaan lisätä samaan tilaukseen."], ["Tuotteko välineet mukana?", "Kyllä, sovitut pesuvälineet ja aineet tuodaan työn mukana."], ["Voinko yhdistää ikkunanpesun siivoukseen?", "Kyllä, palvelut voidaan yhdistää samaan varaukseen."]],
  },
  "express-delivery-finland": {
    title: "Pikakuljetus Suomessa",
    eyebrow: "Kun lähetyksellä on kiire",
    description: "Nopeat tavara-, huonekalu- ja yrityskuljetukset Uudellamaalla ja koko Suomessa. Nouto ja toimitus sovitaan suoraan ilman välikäsiä.",
    bullets: ["Samana päivänä saatavuuden mukaan", "Suora nouto ja toimitus", "Varausnumero ja seurantalinkki"],
    serviceName: "Pikakuljetus",
    area: "Suomi",
    faq: [["Mitä voitte kuljettaa?", "Kuljetamme esimerkiksi huonekaluja, kodinkoneita, laatikoita ja yritysten tavaralähetyksiä auton kantavuuden ja mittojen rajoissa."], ["Onnistuuko kuljetus samana päivänä?", "Kyllä, jos autolla ja tiimillä on vapaa aika."], ["Kuljetatteko Uudenmaan ulkopuolelle?", "Kyllä, pitkät kuljetukset sovitaan tapauskohtaisesti koko Suomessa."]],
  },
  "furniture-assembly-finland": {
    title: "Kalusteasennus Suomessa",
    eyebrow: "Kalusteet käyttövalmiiksi",
    description: "IKEA- ja muiden kalusteiden kokoaminen, purku ja siirto muuton yhteydessä tai erillisenä työnä.",
    bullets: ["Kaapit, sängyt ja pöydät", "Purku ennen muuttoa", "Pakkausmateriaalien poisvienti sovittaessa"],
    serviceName: "Kalusteasennus",
    area: "Suomi",
    faq: [["Voitteko purkaa kalusteet ennen muuttoa?", "Kyllä, purku ja uudelleenkokoaminen voidaan sopia samaan tilaukseen."], ["Kokoatteko IKEA-kalusteita?", "Kyllä, kokoamme tavallisia IKEA- ja muiden valmistajien kalusteita."], ["Tarvitaanko omat työkalut?", "Tiimi tuo tavalliset asennustyökalut mukanaan."]],
  },
  privacy: {
    title: "Tietosuojaseloste",
    eyebrow: "Tietosi ovat turvassa",
    description: "Muuttobotti käsittelee yhteystietoja ja varaustietoja vain palvelun tuottamiseen, viestintään, laskutukseen ja lakisääteisten velvoitteiden täyttämiseen.",
    bullets: ["Tietojen minimointi", "Suojattu käsittely", "Oikeus tarkastaa ja korjata tiedot"],
    legal: true,
  },
  terms: {
    title: "Palveluehdot ja evästeet",
    eyebrow: "Selkeät ehdot",
    description: "Vahvistettu tarjous kertoo palvelun sisällön, hinnan, aikataulun ja mahdolliset lisämaksut. Evästeasetuksia voi hallita sivuston ilmoituksesta.",
    bullets: ["Läpinäkyvä hinnoittelu", "Peruutusehdot vahvistuksessa", "Välttämättömät ja valinnaiset evästeet"],
    legal: true,
  },
};
