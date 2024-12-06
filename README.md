# Y - The new age of social media

Dette prosjektet er tilgjengelig [på nett også!](http://it2810-06.idi.ntnu.no/project2/)

## Oppsett

Frontend kan kjøres med:

```bash
cd frontend
npm install
npm run dev
```

Backend kan kjøres med:

```bash
cd backend
npm install
npm run start:dev
```

> [!NOTE]
> To run the project locally, both the backend and the frontend must be running on seperate terminals. When running the project locally, images are uploaded to your own computer. These locally stored images will not be accessible on the production website. This setup is optimal for testing and simulating how image uploads will behave on the virtual machine (VM).

End-2-end tester kan kjøres med (sørg for at backend og frontend kjøres):

```
cd frontend
npm run cypress:run
```

Komponent tester kan kjøres med:

```
cd frontend
npm run test
```

## Backend

Les [README for backend her](backend/README.md).

## Frontend

Les [README for frontend her](frontend/README.md).

## Filstruktur

```bash
.
├── README.md
├── backend
│   ├── README.md
│   ├── express.d.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── auth.ts
│   │   ├── index.ts
│   │   ├── models
│   │   │   ├── comment.ts
│   │   │   ├── context.ts
│   │   │   ├── hashtag.ts
│   │   │   ├── index.ts
│   │   │   ├── notification.ts
│   │   │   ├── post.ts
│   │   │   ├── postItem.ts
│   │   │   ├── repost.ts
│   │   │   └── user.ts
│   │   ├── resolvers
│   │   │   ├── comment
│   │   │   │   ├── index.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── typeResolvers.ts
│   │   │   ├── hashtags
│   │   │   │   ├── index.ts
│   │   │   │   └── queries.ts
│   │   │   ├── notifications
│   │   │   │   ├── index.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── typeResolvers.ts
│   │   │   ├── post
│   │   │   │   ├── index.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── typeResolvers.ts
│   │   │   ├── repost
│   │   │   │   ├── index.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── typeResolvers.ts
│   │   │   └── user
│   │   │       ├── index.ts
│   │   │       ├── mutations.ts
│   │   │       ├── queries.ts
│   │   │       └── typeResolvers.ts
│   │   ├── schema
│   │   │   └── schema.graphql
│   │   ├── schema.ts
│   │   ├── uploadFile.ts
│   │   └── utils.ts
│   └── tsconfig.json
└── frontend
    ├── README.md
    ├── components.json
    ├── cypress
    │   ├── e2e
    │   │   ├── home.cy.ts
    │   │   └── user.cy.ts
    │   └── support
    │       ├── commands.d.ts
    │       ├── commands.ts
    │       └── e2e.ts
    ├── cypress.config.js
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   ├── coverphoto.jpg
    │   ├── cute_cat_404.gif
    │   └── y.jpg
    ├── src
    │   ├── components
    │   │   ├── Hashtags
    │   │   │   ├── HashtagBlock.tsx
    │   │   │   └── HashtagCard.tsx
    │   │   ├── Landing
    │   │   │   ├── FollowSuggestionsSidebar.tsx
    │   │   │   └── TrendingSidebar.tsx
    │   │   ├── Navbar
    │   │   │   ├── DropdownMenu.tsx
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── Notifications
    │   │   │   │   ├── NotificationCard.tsx
    │   │   │   │   └── Notifications.tsx
    │   │   │   ├── SearchBar.tsx
    │   │   │   └── ThemeToggle.tsx
    │   │   ├── Post
    │   │   │   ├── Comment.tsx
    │   │   │   ├── DeletedPost.tsx
    │   │   │   ├── Post.tsx
    │   │   │   ├── PostBody.tsx
    │   │   │   ├── PostContent.tsx
    │   │   │   ├── PostWithReply.tsx
    │   │   │   └── Repost.tsx
    │   │   ├── Profile
    │   │   │   ├── CommentsView.tsx
    │   │   │   ├── EditProfile.tsx
    │   │   │   ├── FollowingUsersModal.tsx
    │   │   │   ├── LikesView.tsx
    │   │   │   ├── MentionsView.tsx
    │   │   │   └── PostsView.tsx
    │   │   ├── Skeletons
    │   │   │   ├── CardSkeleton.tsx
    │   │   │   ├── HashtagBlockSkeleton.tsx
    │   │   │   ├── LargeCardSkeleton.tsx
    │   │   │   ├── PostSkeleton.tsx
    │   │   │   ├── PostWithReplySkeleton.tsx
    │   │   │   ├── ProfileBlockSkeleton.tsx
    │   │   │   └── ProfileSkeleton.tsx
    │   │   ├── Users
    │   │   │   ├── Avatar.tsx
    │   │   │   ├── FollowButton.tsx
    │   │   │   ├── ProfileBlock.tsx
    │   │   │   ├── ProfileCard.tsx
    │   │   │   ├── ProfilePreview.tsx
    │   │   │   ├── Username.tsx
    │   │   │   └── VerificationBadge.tsx
    │   │   └── ui
    │   │       ├── BackButton.tsx
    │   │       ├── Divider.tsx
    │   │       ├── Footer.tsx
    │   │       ├── ToggleGroup.tsx
    │   │       ├── button.tsx
    │   │       ├── popover.tsx
    │   │       ├── toggle.tsx
    │   │       └── tooltip.tsx
    │   ├── form
    │   │   ├── CreatePostField.tsx
    │   │   ├── FormField.tsx
    │   │   ├── LoginForm.tsx
    │   │   └── TextInput.tsx
    │   ├── globals.css
    │   ├── hooks
    │   │   ├── AuthContext.tsx
    │   │   └── useDebounce.tsx
    │   ├── lib
    │   │   ├── apolloClient.ts
    │   │   ├── checkFile.ts
    │   │   ├── dateUtils.ts
    │   │   ├── types.ts
    │   │   └── utils.ts
    │   ├── main.tsx
    │   ├── pages
    │   │   ├── CommentPage.tsx
    │   │   ├── HashtagPage.tsx
    │   │   ├── HashtagsPage.tsx
    │   │   ├── HomePage.tsx
    │   │   ├── NotFound.tsx
    │   │   ├── PostPage.tsx
    │   │   ├── Profile.tsx
    │   │   ├── Search.tsx
    │   │   └── UsersPage.tsx
    │   ├── queries
    │   │   ├── comments.ts
    │   │   ├── hashtags.ts
    │   │   ├── notifications.ts
    │   │   ├── posts.ts
    │   │   ├── reposts.ts
    │   │   ├── search.ts
    │   │   └── user.ts
    │   ├── test
    │   │   ├── components
    │   │   │   ├── Footer.test.tsx
    │   │   │   ├── LoginForm.test.tsx
    │   │   │   ├── Navbar
    │   │   │   │   ├── DropdownMenu.test.tsx
    │   │   │   │   ├── Navbar.test.tsx
    │   │   │   │   ├── ThemeToggle.test.tsx
    │   │   │   ├── Post
    │   │   │   │   ├── PostBody.test.tsx
    │   │   │   │   └── PostContent.test.tsx
    │   │   └── setup.ts
    │   ├── types
    │   │   └── apollo-upload-client.d.ts
    │   └── vite-env.d.ts
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

## Produktkrav

### Funksjonalitet

Løsningen skal være en prototyp på en søkbar katalog med frontend hvor brukeren skal kunne formulere et søk og få presentert et søkeresultat, som bruker i etterkant kan ha interaksjon med. Funksjonalitet som skal støttes:

- [x] Søkemulighet eks. med en dialog/form/søkefelt for input av søk
  - Brukerne kan i søkefeltet søke etter brukere, innlegg, kommentarer, brukere eller hashtags. Brukeren kan enten velgen en auto suggested bruker eller hashtag, eller gå til søk siden og få opp alle resultatene for søket sitt.
- [x] Listebasert presentasjon av søkeresultat hvor det er lagt opp til håndtering av store resultatsett med enten blaing i sider, eller dynamisk laster av flere resultater ved scrolling
  - Søke siden viser initielt kun de 10 første resultatene av hver type. Når brukeren blar nedover vil det automatisk hente inn en til side med 10 nye søkeresultater.
- [x] Muligheten for å se mer detaljer om hvert av objekten
  - Brukere kan trykke på innlegg, kommentarer eller brukere og vil bli omdirigert til en side med mer informasjon.
- [x] Mulighet for sortering og filtrering av resultatsettet (merk at sortering og filtrering skal utføres på hele resultatsettet og ikke bare det som tilfeldigvis er laster inn på klienten)
  - Brukere kan sortere innlegg basert på kriteriene: nyligste, mest likte, kontroversielt (antall kommentarer) og hva folk brukeren følger har lagt ut. I tilegg kan man filtrere mellom innlegg, brukere og hashtags i søke siden.
- [x] Det skal inngå en eller annen form for brukergenererte data som skal lagres (persistent på databaseserveren) og presenteres (enten bruker som legger til informasjon, reviews, ratings etc, historikk om søkene eller annet, handleliste).
  - Brukere kan lage brukere, opprette innlegg, kommentere innlegg, like innlegg, 'reposte' innlegg, laste opp profil/bakgrunnsbilde og oppdatere informasjon om seg selv som blir delt med andre brukere.
- [x] Løsningen skal demonstrere aspekter ved universell utforming / web accessibility (tilgjengelighet).

  - Vi har brukt semantiske HTML-elementer som `<section>`, `<header>` og `<main>` for å strukturere innholdet og gjøre det lettere tilgjengelig for skjermlesere. ARIA-attributter som `aria-label` og `aria-hidden` er lagt til der det er nødvendig for å gi skjermlesere riktig kontekst og navigasjonsinformasjon. Vi har sikret god kontrast mellom tekst og bakgrunn samt implementert full støtte for tastaturnavigasjon for å møte kravene til universell utforming. Alle sider på nettsiden har en (nær) perfekt score på tilgjengelighet på Lighthouse-testen.

- [x] Løsningen skal demonstrere aspekter ved bærekraftig webutvikling (gjennom valg som gjøres i design)

  - Vi har implementert paginering av resultater for å redusere mengden data som sendes fra serveren til klienten, noe som både reduserer belastningen på serveren og minimerer energibruk ved datatransport. Profilbilder blir automatisk beskåret til 300x300 piksler ved opplasting, noe som reduserer filstørrelsen og optimaliserer ytelsen ved visning, samtidig som vi unngår unødvendige databasekall for hver forespørsel. Disse tiltakene bidrar til en mer bærekraftig webutvikling ved å minimere ressursforbruk og forbedre brukeropplevelsen.

- [x] God design, fornuftige valg og løsninger som harmonerer med typen data dere velger
  - Vi har gjennom hele utviklings prosessen tatt hensyn til at applikasjon skal være estetisk og visuelt appelerende. Fargevalget vi har valgt har vært konsistent og brukere kan velge mellom lys og mørk modus.
- [x] Database og backend for prosjektet skal ved innlevering hostes på gruppas virtuelle maskin.
  - Vi har hostet backenden ved å bruke PM2 for prosesshåndtering på Apache2-serveren, noe som sikrer stabilitet og automatisk oppstart ved eventuelle feil. En YAML-fil er satt opp for å bygge og deployere prosjektet automatisk til Apache2-serveren, noe som forenkler arbeidsflyten.

### Bruk av teknologi

- [x] Brukergrensesnitt skal være basert på React og programmert i Typeskript. Prosjektet skal settes opp med Vite
- [x] Bruk av state managment eksempelvis redux, mobx, recoil, apollo local state management etc
  - Vi har valgt å bruke apollo local state management.
- [x] Egendefinert/utviklet GraphQL backend (Node / Typescript), fritt valg av type databaseserver på backend, men prosjektet skal benytte en backend-database som er satt opp av gruppa
  - Backenden vår er GraphQL med Typescript, og databasen er MongoDB som er hostet i vår apache2 server.
- [x] Bruk av gode og relevante komponenter og bibliotek (fritt valg og vi oppfordrer til mest mulig gjenbruk av tredjeparts løsninger)
  - Vi har valgt å bruke en kombinasjon av tredjeparts og egenutviklet løsninger for komponenter. Alle tredjeparts komponenter er hentet fra shadcn/ui, noe som gjør de veldig modifiserbare. Disse kan du finne i [frontend/src/components/](frontend/src/components).

### Testing, utvikling og kvalitetskontroll

- [x] Linting og bruk av Prettier
  - Ved hver pull request har vi sørget for at både Prettier og EsLint har blitt kjørt.
- [x] Gjennomført testing av komponenter (vi bruker Vitest)
- [x] En form for automatisert end-2-end testing (i praksis teste en lengre sekvens av interaksjoner), testing av API'et.
  - End-2-end testene våre kan du finne i [frontend/cypress](frontend/cypress/). Disse testene tester både generell routing av applikasjonen vår. Samt API-et, der testene f.eks. lager innlegg, kommenterer og liker innlegg. Dette sørger for at vi vet at kjernefunksjonaliteten i applikasjonen vår fungerer som det skal.
- [x] Prosjektet dokumenteres med en README.md i git repositoriet. Dokumentasjonen skal diskutere, forklare og vise til alle de viktigste valgene og løsningene som gruppa gjør (inklusive valg av komponenter og api).
- [x] Koden skal være lettlest og godt strukturert og kommentert slik at den er lett å sette seg inn i. Bruk av kommentarer skal være tilpasset at eksterne skal inspisere koden.
- [x] Gruppa skal oppsummere den enkeltes bidrag i prosjektet underveis i en egen fil som leveres i BB (dette er personopplysninger som ingen vil at skal ligge på git ;-)
- [x] Reproduserbarhet: i praksis betyr det at prosjektet skal være dokumentert og enkelt å installere/kjøre for andre (eksempelvis faglærer).

## Oppsummering av funksjonalitet

- Posting og Kommentering
  - Liking av innlegg og kommentarer
  - 'Reposting' av innlegg og kommentarer
  - Redigering av innlegg og kommentarer
  - Share knapp for å kopiere link til innlegg eller kommentar
  - Bildestøtte
  - Tagging av brukere og hashtags
  - Link detektering
  - Slette funksjonalitet
  - Kommentering
  - Dynamisk tegn begrensning visualisering
  - 'Read more' knapp for lengre innlegg og kommentarer
- Søk med bruker/hashtag forslag med lagring av 3 siste søk
- Mørk modus
- Hashtags
- Alle `GET` kall er paginert (med unntak av de som bare henter en enkelt ting)
- Helt hjemmesnekret autentiseringssystem med salting og hashing av passord
- Fire forskjellige filter/sorterings valg på hjemmeside
- Følge funksjonalitet
- Varslinger. Følgende fyrer av en varsel (alle disse blir fjerne om det som forårsaket varselet blir slettet):
  - Å følge noen
  - Å like noens innlegg eller kommentar
  - Å reposte noens innlegg eller kommentar
  - Å kommentere på noens innlegg eller kommentar
  - Å tagge noen i et innlegg eller kommentar
  - Når noen du følger legger ut et nytt innlegg
- Profiler:
  - Profilbilde
  - Coverbilde
  - Bio
  - Brukernavn
  - For- og etternavn
  - Følgere og følger
  - Alle innlegg, alle kommentarer, alle mentions og alle likes
  - Profil preview på hover av brukere
- Profilbilder er kroppet til 300x300px ved opplasting
- Admin bruker
  - Kan slette alle innlegg og kommentarer
  - Kan slette enkeltbrukere, som også sletter alle deres innlegg og kommentarer
- Verifiseringsnivåer (som vises ved siden av brukerens navn)
  - UNVERIFIED: Alle brukere starter som dette
  - VERIFIED: Visse brukere får dette (for det meste venner til oss utviklere)
  - MADS: Én spesifikk bruker fikk denne.
  - DEVELOPER: Oss utviklere
  - Verifisering er gjort manuelt av oss utviklere, så det er ingen automatisk måte å få dette på, og dermed ingen frontend funksjonalitet for å verifisere eller spørre om verifisering.
- Støtte for vinduer så små som 300px i bredden
- Dynamisk tittel på nettsiden basert på hvilken side du er på og hva innholdet er
- Skeleton loading på alle sider
- Helt hjemmesnekret 404 not found side
