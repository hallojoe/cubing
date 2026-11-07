# Algorithm applicability audit

The question is whether the sequence teaches its stated purpose on a size, not merely whether its turns are legal.

## Learning Lab decisions

| Technique | 2×2 | 3×3 | 4×4–11×11 | Decision |
| --- | --- | --- | --- | --- |
| Right / left trigger | Corner and finger-trick drill | Layer-by-layer building block | Outer-turn drill; solving use after reduction | Keep on all sizes |
| Sexy Move | Corner and finger-trick drill | Common trigger | Outer-turn drill; solving use after reduction | Keep on all sizes |
| Sledgehammer | Corner and finger-trick drill; no F2L edge pair exists | F2L building block | F2L use after reduction | Keep; explain the 2×2 distinction |
| Sune / Anti-Sune | Last-layer corner orientation | Last-layer corner orientation | Corresponding reduced 3×3-stage corner case | Enable on 2×2 as well |
| OLL Cross | No edges to orient | Last-layer edge orientation | Edge-group orientation after reduction | Exclude 2×2 |

No additional existing algorithm needs removing from 4×4–11×11. All seven sequences use **outer face turns only**. Those turns preserve solid centers and fully paired edge groups, so their reduced-puzzle effect carries over. This is not a claim that they solve centers, pair edges, or fix parity. Triggers can still be practiced independently as movement drills.

For solving use, larger cubes require centers in the correct color scheme and **every** edge group paired. Match the case and its orientation. Sune and Anti-Sune are not complete last-layer methods; OLL Cross needs the appropriate line setup or multiple applications for other patterns. The Learning Lab continues to start solved to demonstrate an effect, rather than claiming to solve a scramble.

The shared `isAlgorithmApplicable` predicate guards both menu filtering and lesson construction. An optional maximum size supports future size-specific lessons without relying on a minimum-only policy.

## Pro Lab scope

- 2×2 CLL / EG discussion is restricted to 2×2. The Sune S1 preset is one CLL example, not a complete CLL or EG library.
- F2L / PLL topics require edges and are hidden on 2×2. Larger sizes display reduction prerequisites.
- The exact `2R2 U2 2R2 Uw2 2R2 Uw2` PLL parity recipe is offered **only on 4×4**. The standard six-turn recipe includes a net U2 corner alignment; the second preset appends U2 so the net visible effect is an opposite edge-group swap with corners restored. Other PLL/AUF work may remain in a real solve.
- Reduction theory is available on 4×4–11×11. It does not offer unverified generalized parity recipes. Odd cubes can have wing-pairing difficulties before reduction, even though fully reduced odd cubes do not have 4×4-style PLL parity.
- Commutators and conjugates are available for all sizes. An arbitrary commutator is not promised to be a three-cycle.
- Custom experiments permit legal turns even when the user changes the preset to a sequence with a different solving purpose. The topic's prerequisites apply to the preset, not to arbitrary user edits.

## Notation conventions

`R` = outer right face; `2R` = only the second slice; `Rw` / `r` = two-layer block; `3Rw` = three-layer block. Whole-cube rotations `x y z` follow `R U F`. `M E S` mean the unique middle slice on odd cubes and follow `L D F`; ambiguous even-cube middle-slice symbols are rejected. Half turns accept `2` or `2'`. Unicode prime is normalized.

The builder expands `[A, B]` as `A B A⁻¹ B⁻¹` and `[A: B]` as `A B A⁻¹`. Inputs are space-separated sequences; nesting/repetition syntax is not supported. The expanded length is limited to 240 turns. Counts shown are notation turns, not a competition metric.

Case mode constructs the start by applying the sequence's inverse to solved. It guarantees that this exact experiment ends solved; it does not generate arbitrary scrambles or prove that a sequence solves every case in an algorithm family. Changed-piece counts track physical identities, including indistinguishable centers, and use the fixed frame.

## Sources and verification

- [J Perm: CLL examples, including Sune S1](https://jperm.net/algs/2x2/cll)
- [J Perm: 2-look OLL, Sune and Anti-Sune](https://jperm.net/algs/2lookoll)
- [J Perm: 4×4 reduction prerequisites](https://jperm.net/4x4)
- [J Perm: 5×5 reduction and last-edge handling](https://jperm.net/5x5)
- [J Perm: exact 4×4 PLL parity notation](https://jperm.net/algs/4x4/pll)
- [J Perm: 2×2 method prerequisites](https://jperm.net/2x2/faster)
- [Jaap Scherphuis: conjugation and commutation](https://www.jaapsch.net/puzzles/theory.htm)

The 6×6–11×11 outer-turn applicability conclusion follows from reduction and is also checked directly in the cube model. Tests compare corner effects with 3×3, require every center color to stay solved and every edge group to remain paired after every offered lesson, and verify six repetitions of Sexy Move restore solved colors on each supported size. Pro tests independently verify the T/U permutation piece counts, the aligned 4×4 parity effect, wide/slice/rotation conventions, inverses, size filtering, invalid notation and constructed-case round trips across 2×2–11×11.
