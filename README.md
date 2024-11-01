# Y (Twitter Clone)

Dette prosjektet er tilgjengelig [på nett også!](http://it2810-06.idi.ntnu.no/project2/)

## Backend

Les [README for backend her](backend/README.md).

## Frontend

Les [README for frontend her](frontend/README.md).

## Produktkrav

### Funksjonalitet

Løsningen skal være en prototyp på en søkbar katalog med frontend hvor brukeren skal kunne formulere et søk og få presentert et søkeresultat, som bruker i etterkant kan ha interaksjon med. Funksjonalitet som skal støttes:

- [x] Søkemulighet eks. med en dialog/form/søkefelt for input av søk
- [ ] Listebasert presentasjon av søkeresultat hvor det er lagt opp til håndtering av store resultatsett med enten blaing i sider, eller dynamisk laster av flere resultater ved scrolling
- [x] Muligheten for å se mer detaljer om hvert av objekten
- [x] Mulighet for sortering og filtrering av resultatsettet (merk at sortering og filtrering skal utføres på hele resultatsettet og ikke bare det som tilfeldigvis er laster inn på klienten)
- [x] Det skal inngå en eller annen form for brukergenererte data som skal lagres (persistent på databaseserveren) og presenteres (enten bruker som legger til informasjon, reviews, ratings etc, historikk om søkene eller annet, handleliste).
- [x] Løsningen skal demonstrere aspekter ved universell utforming / web accessibility (tilgjengelighet).
- [x] Løsningen skal demonstrere aspekter ved bærekraftig webutvikling (gjennom valg som gjøres i design)
- [x] God design, fornuftige valg og løsninger som harmonerer med typen data dere velger
- [x] Database og backend for prosjektet skal ved innlevering hostes på gruppas virtuelle maskin.

### Bruk av teknologi

- [x] Brukergrensesnitt skal være basert på React og programmert i Typeskript. Prosjektet skal settes opp med Vite
- [x] Bruk av state managment eksempelvis redux, mobx, recoil, apollo local state management etc
- [x] Egendefinert/utviklet GraphQL backend (Node / Typescript), fritt valg av type databaseserver på backend, men prosjektet skal benytte en backend-database som er satt opp av gruppa
- [x] Bruk av gode og relevante komponenter og bibliotek (fritt valg og vi oppfordrer til mest mulig gjenbruk av tredjeparts løsninger)

### Testing, utvikling og kvalitetskontroll

- [x] Linting og bruk av Prettier
- [ ] Gjennomført testing av komponenter (vi bruker Vitest)
- [ ] En form for automatisert end-2-end testing (i praksis teste en lengre sekvens av interaksjoner), testing av API'et.
- [x] Prosjektet dokumenteres med en README.md i git repositoriet. Dokumentasjonen skal diskutere, forklare og vise til alle de viktigste valgene og løsningene som gruppa gjør (inklusive valg av komponenter og api).
- [x] Koden skal være lettlest og godt strukturert og kommentert slik at den er lett å sette seg inn i. Bruk av kommentarer skal være tilpasset at eksterne skal inspisere koden.
- [ ] Gruppa skal oppsummere den enkeltes bidrag i prosjektet underveis i en egen fil som leveres i BB (dette er personopplysninger som ingen vil at skal ligge på git ;-)
- [x] Reproduserbarhet: i praksis betyr det at prosjektet skal være dokumentert og enkelt å installere/kjøre for andre (eksempelvis faglærer).
