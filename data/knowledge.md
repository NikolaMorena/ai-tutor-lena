<!--
  KNOWLEDGE BASE
  ==============
  Each topic starts with "## Topic name" and contains the text below it, up to the next "##".
  The server reads this on startup and automatically:
    - builds the material sent to the model (each topic becomes "[MATERIAL N — name]")
    - builds the list of topics for the buttons in "Knowledge check" mode
  To add, edit or delete a topic: just edit this file and restart the server (or call
  POST /api/reload). There is no need to touch any .js file.
-->

## Prokaryotic and eukaryotic cells

Based on the type of cellular organization, organisms are divided into:
1) Prokaryotes — bacteria, archaebacteria, blue-green algae. Prokaryotic DNA is circular and is located
in a part of the cytoplasm called the nucleoid.
2) Eukaryotes — have a clearly differentiated nucleus. Their DNA is linear.

Prokaryotic cells are much smaller than eukaryotic cells (0.1–10 μm versus 10–100 μm) and appeared about
3.5 billion years ago. Evolution in prokaryotes went in the direction of increasingly complex metabolic
processes ("masters of biochemistry"), while in eukaryotes it went in the direction of increasingly
complex structure — various organelles with specific functions appeared inside the cell.

Structure of the prokaryotic cell: cell wall, cell membrane (with infoldings, i.e. mesosomes, which
increase the internal surface area), cytoplasm with the nucleoid (DNA) and ribosomes; some also have a
capsule, plasmids (extrachromosomal DNA outside the nucleoid), pili and a flagellum (protein structures
for movement). The only organelles they have are ribosomes. The most common type of division is simple
division (binary fission, direct division — amitosis). By mode of nutrition: autotrophic
(photoautotrophic, chemoautotrophic) and heterotrophic (decomposers, parasites, mutualists). By cell wall
structure: gram-positive and gram-negative bacteria (they differ in the thickness of the peptidoglycan
layer and in the presence of an outer membrane with lipopolysaccharides in gram-negative bacteria).

## Organelles: ER, Golgi apparatus, lysosomes, vacuole

Ribosomes are the only universal organelles — they exist in both prokaryotes and eukaryotes. Their role
is protein synthesis, which they carry out in the form of polyribosomes (polysomes). They can be free or
bound. In prokaryotes translation takes place in the cytoplasm; in eukaryotes, everywhere ribosomes are
present — the cytoplasm, rough ER, outer nuclear membrane, mitochondria, chloroplasts.

The endoplasmic reticulum (ER) exists in two types: rough ER (has ribosomes on its surface; proteins are
made here, to which oligosaccharides can be added) and smooth ER (has no ribosomes; lipids are made here).
Macromolecules from the ER travel in the form of transport vesicles to the Golgi apparatus, where their
final chemical (secretory) modification takes place.

The Golgi apparatus consists of saccules that together form a dictyosome, and has two regions: the cis
region (facing the ER, where transport vesicles enter) and the trans region (facing the cell membrane,
where secretory vesicles exit).

Lysosomes are the "cleaners" of the cell — they break down unusable substances, both from the cell itself
(autophagy) and those that came from the external environment (heterophagy, e.g. after phagocytosis).
They contain hydrolytic enzymes active at pH=2, collectively called acid hydrolases. They form by budding
from the Golgi apparatus, and their enzymes are synthesized on the rough ER. They can be primary
(inactive, with no substrate to break down) or secondary (active, formed by the fusion of a primary
lysosome with the substrate to be broken down — e.g. with a phagosome or a worn-out organelle). Pathway:
1. primary lysosome, 2. phagocytosis (a phagosome forms), 3. fusion of the primary lysosome and the
phagosome, 4. (alternatively) fusion of the primary lysosome with a worn-out organelle, 5. active
transport of the hydrolysis products into the cytoplasm, 6. exocytosis (expulsion of the residues).

The vacuole exists in plants, fungi and some protists. Roles: maintaining turgor (plant rigidity),
collecting harmful substances, storing organic molecules/ions/water, containing pigments that give color,
and a role similar to that of the lysosome.

## Nucleus, chromatin and chromosome

The nucleus is the control center of the cell because it contains the DNA. It has two membranes, with the
perinuclear space (cisterna) between them. Nuclear pores allow communication between the nucleus and the
cytoplasm: all types of RNA (mRNA, rRNA, tRNA) and ribosomal subunits exit the nucleus into the
cytoplasm, and proteins enter the nucleus from the cytoplasm.

The following take place in the nucleus: replication (synthesis of DNA from DNA), transcription
(synthesis of all types of RNA from DNA) and maturation (mature mRNA, rRNA and tRNA are produced from
primary transcripts). Translation (protein synthesis) NEVER takes place in the nucleus — it always takes
place in the cytoplasm, everywhere ribosomes are present.

The interior of the nucleus is the nucleoplasm, whose main component is chromatin (DNA + histone and
non-histone proteins). Chromatin can be heterochromatin (condensed, transcriptionally inactive) or
euchromatin (loosened, transcriptionally active — a gene is "free"/active when the DNA is not tightly
wound around histones). Chromatin is seen during interphase (the time between two cell divisions), and
chromosomes during cell division (mitosis or meiosis) — chromatin is the unpacked form, the chromosome is
the packed form of the same material.

Levels of packing: DNA double helix → winds around histones and forms nucleosomes → nucleosomes are
packed into the chromatin fiber → further condensed into a chromosome (two chromatids joined at the
centromere, with arms).

The shape (morphology) of a chromosome depends on the position of the centromere (primary constriction):
metacentric (M), submetacentric (SM), acrocentric (A).

The nucleolus is an organelle without a membrane; it forms at the site of the acrocentric chromosomes (in
humans: group D — pairs 13, 14, 15 and group G — pairs 21, 22; these chromosomes are called NOR, the
nucleolar organizer). rRNA is made in the nucleolus and combines with ribosomal proteins (made in the
cytoplasm, having entered through the nuclear pores) to form the small and large ribosomal subunits —
these then exit into the cytoplasm through the nuclear pores. The more synthetically active the cell
(more euchromatin), the larger the nucleolus or the more nucleoli there are.

## Cell cycle and DNA replication

The cell cycle consists of interphase and mitosis. Interphase has three phases: G1, S (synthesis — DNA
replication) and G2. Before replication a chromosome has one chromatid (1 DNA molecule, 2 DNA strands).
After replication in the S phase, the chromosome has two chromatids (2 DNA molecules, 4 DNA strands),
with the two chromatids joined at the centromere.

Mitosis has four phases, in order: prophase (P), metaphase (M), anaphase (A), telophase (T).
