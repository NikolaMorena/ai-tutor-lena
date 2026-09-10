<!--
  BAZA ZNANJA
  ===========
  Svaka tema počinje sa "## Naziv teme" i sadrži tekst ispod, sve do sledećeg "##".
  Server ovo čita pri pokretanju i automatski:
    - gradi materijal koji se šalje modelu (svaka tema postaje "[MATERIJAL N — naziv]")
    - gradi listu tema za dugmad u režimu "Provera znanja"
  Da dodaš, izmeniš ili obrišeš temu: samo uredi ovaj fajl i restartuj server (ili pozovi
  GET /api/reload ako je uključen u server.js). Nema potrebe da diraš bilo koji .js fajl.
-->

## Prokariotska i eukariotska ćelija

U odnosu na tip ćelijske organizacije organizmi se dele na:
1) Prokariota — bakterije, arhebakterije, modrozelene alge. Prokariotska DNK je cirkularna (kružna) i
nalazi se u delu citoplazme koji se zove nukleoid.
2) Eukariota — imaju jasno diferencirano jedro. DNK je linearna (linijska).

Prokariotske ćelije su mnogo sitnije od eukariotskih (0,1–10 μm naspram 10–100 μm) i pojavile su se pre
oko 3,5 milijardi godina. Evolucija kod prokariota išla je u pravcu usložnjavanja metaboličkih procesa
("majstori biohemije"), dok je kod eukariota išla u pravcu usložnjavanja građe — unutar ćelije su se
javile različite organele sa specifičnim funkcijama.

Građa prokariotske ćelije: ćelijski zid, ćelijska membrana (sa uvratima tj. mezozomima koji povećavaju
unutrašnju površinu), citoplazma sa nukleoidom (DNK) i ribozomima; kod nekih i kapsula, plazmidi
(vanhromozomska DNK van nukleoida), pili i bič (flagela — proteinske strukture za kretanje). Od organela
imaju samo ribozome. Najčešći tip deobe je prosta deoba (binarna, fisiona, direktna — amitoza). Prema
načinu ishrane: autotrofne (fotoautotrofne, hemoautotrofne) i heterotrofne (razlagači, paraziti,
mutualisti). Prema građi ćelijskog zida: gram-pozitivne i gram-negativne bakterije (razlikuju se po
debljini peptidoglikana i prisustvu spoljašnje membrane sa lipopolisaharidima kod gram-negativnih).

## Organele: ER, Golgijev aparat, lizozomi, vakuola

Ribozomi su jedine univerzalne organele — postoje i kod prokariota i kod eukariota. Uloga im je sinteza
proteina, a to obavljaju u formi poliribozoma (polizoma). Mogu biti slobodni ili vezani. Kod prokariota
translacija se odvija u citoplazmi; kod eukariota na svim mestima gde ima ribozoma — citoplazma,
granulisani ER, spoljašnja jedrova membrana, mitohondrije, hloroplasti.

Endoplazmatični retikulum (ER) postoji u dva tipa: granulisani ER (ima ribozome na površini, ovde nastaju
proteini kojima se mogu dodavati oligosaharidi) i agranulisani ER (nema ribozome, ovde nastaju lipidi).
Makromolekuli iz ER putuju u obliku transportnih (prenosnih) vezikula ka Golgijevom aparatu, gde se vrši
njihova konačna hemijska (žlezdana) modifikacija.

Golgijev aparat sastoji se od sakula koje zajedno čine diktiozom, i ima dva regiona: cis-region (okrenut
ka ER, ovde ulaze prenosne vezikule) i trans-region (okrenut ka ćelijskoj membrani, odavde izlaze
sekretorne vezikule).

Lizozomi su "čistači" ćelije — razlažu neupotrebljive materije, i to iz same ćelije (autofagija) i one
koje su došle iz spoljašnje sredine (heterofagija, npr. posle fagocitoze). Sadrže hidrolitičke enzime
aktivne na pH=2, zajedničkog naziva kisele hidrolaze. Nastaju pupljenjem od Golgijevog aparata, a njihovi
enzimi se sintetišu na granulisanom ER. Mogu biti primarni (neaktivni, nemaju supstrat za razlaganje) ili
sekundarni (aktivni, nastaju spajanjem primarnog lizozoma sa supstratom koji treba razložiti — npr. sa
fagosomom ili dotrajalom organelom). Put: 1. primarni lizozom, 2. fagocitoza (nastaje fagosom),
3. spajanje primarnog lizozoma i fagosoma, 4. (alternativno) spajanje primarnog lizozoma sa dotrajalom
organelom, 5. aktivni transport produkata hidrolize u citoplazmu, 6. egzocitoza (izbacivanje ostataka).

Vakuola postoji kod biljaka, gljiva i nekih protista. Uloge: održavanje turgora (čvrstine biljke),
sakupljanje štetnih materija, rezerva organskih molekula/jona/vode, sadrži pigmente koji daju boju,
ima sličnu ulogu kao lizozom.

## Jedro, hromatin i hromozom

Jedro (nucleus) je kontrolni centar ćelije jer se u njemu nalazi DNK. Ima dve membrane, između kojih je
perinuklearni prostor (cisterna). Jedrove pore omogućavaju komunikaciju jedra i citoplazme: iz jedra u
citoplazmu izlaze svi tipovi RNK (iRNK, rRNK, tRNK) i ribozomalne subjedinice, a iz citoplazme u jedro
ulaze proteini.

U jedru se dešavaju: replikacija (sinteza DNK od DNK), transkripcija (sinteza svih tipova RNK od DNK) i
maturacija/sazrevanje (od primarnih transkripata nastaju zrele iRNK, rRNK, tRNK). Translacija (sinteza
proteina) se NIKADA ne dešava u jedru — uvek se odvija u citoplazmi, na svim mestima gde ima ribozoma.

Unutrašnjost jedra čini nukleoplazma, čiji je glavni sastojak hromatin (DNK + histonski i nehistonski
proteini). Hromatin može biti heterohromatin (kondenzovan, transkripciono neaktivan) ili euhromatin
(razlabavljen, transkripciono aktivan — gen je "slobodan"/aktivan kad DNK nije čvrsto namotana oko
histona). Hromatin vidimo tokom interfaze (vreme između dve ćelijske deobe), a hromozome tokom ćelijske
deobe (mitoze ili mejoze) — hromatin je nepakovana forma, hromozom je upakovana forma istog materijala.

Nivoi pakovanja: DNK dvolanac → namotava se oko histona i formira nukleozome → nukleozomi se pakuju u
hromatinsko vlakno → dodatno se kondenzuje u hromozom (dve hromatide povezane u centromeri, sa kracima).

Oblik (morfologija) hromozoma zavisi od položaja centromere (primarnog suženja): metacentrični (M),
submetacentrični (SM), akrocentrični (A).

Jedarce (nukleolus) je organela bez membrane, nastaje na mestu akrocentričnih hromozoma (kod ljudi:
D grupa — 13, 14, 15 i G grupa — 21, 22 par; ovi hromozomi se zovu NOR, nukleolarni organizator). U
nukleolusu nastaje rRNK, koja se spaja sa ribozomalnim proteinima (nastalim u citoplazmi, ušlim kroz
jedrove pore) i formira malu i veliku subjedinicu ribozoma — one zatim kroz jedrove pore izlaze u
citoplazmu. Što je ćelija sintetski aktivnija (više euhromatina), nukleolus je veći ili ih ima više.

## Ćelijski ciklus i replikacija DNK

Ćelijski ciklus se sastoji od interfaze i mitoze. Interfaza ima tri faze: G1, S (sinteza — replikacija
DNK) i G2. Pre replikacije hromozom je jednohromatidni (1 molekul DNK, 2 lanca DNK). Posle replikacije
u S fazi, hromozom postaje dvohromatidni (2 molekula DNK, 4 lanca DNK), pri čemu su dve hromatide
povezane u centromeri.

Mitoza ima četiri faze, redosledom: profaza (P), metafaza (M), anafaza (A), telofaza (T).
