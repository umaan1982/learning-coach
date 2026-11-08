---
gaps_per_text: 20
minutes_per_text: 5
bands: 25:A2.1, 40:A2.2, 55:B1.1, 70:B1.2, 85:B2
---

# C-test texts: German

Four texts written for this pack (not taken from any official test), rising from A2 to B2. `scripts/ctest.py make --domain german-b1` turns them into gapped texts using the standard C-test rule (first and last sentence whole; from word 2 of sentence 2, the second half of every second word is deleted; 20 gaps per text). Words in `{braces}` are names and are never gapped.

**Cut-offs (`bands`, % of all 80 gaps) are provisional.** C-test norms come from calibrating against a reference test. Calibrate them with `benchmarks.csv`: when learners' official placement results (Goethe online test, DW, onSET) consistently differ from the band here, shift the cut-offs and note the change below.

Calibration log:
- 2026-11-08: initial cut-offs, not yet calibrated.

## T1 · A2 · Die neue Wohnung
Letzte Woche bin ich in eine neue Wohnung gezogen. Die Wohnung liegt im dritten Stock und hat zwei Zimmer, eine kleine Küche und einen Balkon. Am ersten Tag war alles noch voller Kartons, deshalb habe ich auf dem Sofa geschlafen. Meine Nachbarin hat mir am Samstag beim Auspacken geholfen, und danach haben wir zusammen Kaffee getrunken. Sie wohnt schon seit vielen Jahren im Haus und kennt alle Leute. Jetzt fehlen mir nur noch ein Schrank und eine Lampe für das Schlafzimmer. Ich freue mich schon auf den Sommer auf dem Balkon.

## T2 · B1.1 · Mein Beruf
Seit März arbeite ich als Krankenpfleger in einem großen Krankenhaus in {Köln}. Obwohl die Arbeit oft anstrengend ist, gefällt mir mein Beruf sehr gut, weil ich jeden Tag Menschen helfen kann. Am Anfang war es nicht leicht, die vielen neuen Abläufe zu verstehen, aber meine Kollegen haben mir alles geduldig erklärt. Besonders schwierig finde ich die Nachtschichten, denn danach bin ich meistens so müde, dass ich den ganzen Vormittag schlafe. Trotzdem möchte ich später eine Weiterbildung machen, damit ich mehr Verantwortung übernehmen kann. Ich habe mich schon bei einer Fachschule in der Nähe informiert.

## T3 · B1.2 · Autos in der Innenstadt
In vielen Städten wird zurzeit diskutiert, ob Autos aus der Innenstadt verbannt werden sollten. Befürworter argumentieren, dass die Luft sauberer und die Straßen ruhiger würden, wenn weniger Autos unterwegs wären. Außerdem könnten auf den frei gewordenen Flächen Parks oder Radwege entstehen. Kritiker befürchten dagegen, dass Geschäfte im Zentrum Kunden verlieren, weil viele Menschen nicht mehr bequem zum Einkaufen fahren können. Meiner Meinung nach hängt viel davon ab, wie gut der öffentliche Nahverkehr ausgebaut ist. Wenn Busse und Bahnen günstig und zuverlässig sind, steigen die meisten Leute gern um.

## T4 · B2 · Arbeiten von zu Hause
Die Digitalisierung hat die Arbeitswelt in den letzten Jahren grundlegend verändert. Während früher die meisten Beschäftigten täglich ins Büro pendelten, ermöglichen heute zahlreiche Unternehmen ihren Mitarbeitern, zumindest teilweise von zu Hause aus zu arbeiten. Diese Entwicklung bringt unbestreitbare Vorteile mit sich, etwa die eingesparte Fahrzeit oder eine flexiblere Gestaltung des Alltags. Gleichzeitig klagen jedoch manche Arbeitnehmer darüber, dass die Grenze zwischen Beruf und Privatleben zunehmend verschwimmt und sie sich von ihrem Team isoliert fühlen. Fachleute empfehlen daher, feste Arbeitszeiten zu vereinbaren und regelmäßige Treffen vor Ort einzuplanen. Ob sich dieses Modell langfristig durchsetzt, bleibt abzuwarten.
