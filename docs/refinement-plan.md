# Curriculum and mobile refinement

The existing pastel identity and official Luna, Nori, and Mimi chibi artwork remain authoritative. This is an extension of the existing routes, not a new visual identity.

## Direction

- Cream `#fffaf4`: reading surface. Plum `#453352`: text and primary actions. Mint `#dcf2e8`: measurements and success. Lilac `#ece0fb`: lessons. Pink `#fce0eb`: games. Gold `#f4c764`: earned stars.
- Fredoka remains the heading face; Nunito is for reading and controls. Body text is at least 16px in the new learning experience, with a 65ch reading measure.
- Mobile lessons follow: goal → manipulable diagram → explanation → worked solution → two checks → next lesson. Formula references use disclosure rather than long walls of cards.
- Lesson index uses a two-term curriculum with list rows. Games use four distinct activities, with instructions before play. Existing navigation and mascots stay familiar.
- Success animation is the focal motion: a short star burst and counter update after an earned reward. Remove repetitive page entrances and perpetual decoration from task surfaces. Reduce-motion preserves the confirmation without movement.
- Generated mascot artwork supplies the companions. After the user authorized new geometry sprites, a transparent six-solid sheet was added for shape recognition. Mathematical visuals remain exact SVG diagrams with native sliders and buttons, so labels, proportions, and computed results remain reliable and accessible.

## Product decisions

- User confirmed untimed games by default, with optional challenges.
- User requested sound throughout: short synthesized interface tones, success/retry/reward cues, and a persistent visible mute control. No autoplay before interaction.
- Existing browser progress is preserved and migrated. Existing lesson IDs 1–10 retain their subject. New lessons use IDs 11–18.
- Cover all 17 supplied topics in 18 lessons: right-triangle foundations and ratios get separate lessons.
- Practice draws a fresh set of 10 questions from the two-check lesson bank and offers term filters plus review of missed answers.
- Currency rates are explicitly illustrative; the curriculum does not claim official accreditation.

## Source and accuracy notes

The user's pasted two-term outline is the primary curriculum reference. All explanations and worked examples are authored for this app.

- NIST, SI Units – Volume: https://www.nist.gov/pml/owm/si-units-volume
- NIST, SI unit conversion factors: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9
- OpenStax, Precalculus 2e, Chapter 8 key equations: https://openstax.org/books/precalculus-2e/pages/8-key-equations

Clarifications to the supplied outline: the prism lateral-area formula Ph assumes a right prism; cone/pyramid slant height differs from vertical height; clockwise bearings require quadrant correction (atan2 of east, north), and a zero displacement has no direction. Area and volume conversion factors must be squared and cubed. Sine-rule SSA can be ambiguous. Purchasing whole containers requires rounding up after calculating the required quantity.

## Verification scope

Build and type checks; meaningful tests for curriculum integrity, migration, reward deduplication, and math/game calculations; browser checks for lesson completion, game play, practice review, sound toggle, mobile widths, and reduced motion. One batched mobile/desktop inspection, then a bounded correction/confirmation pass.
