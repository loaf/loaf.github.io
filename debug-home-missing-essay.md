[OPEN] Debug Session: home-missing-essay

## Symptom

- New essay appears under `/essays/` but not on the homepage blog list during local dev.

## Scope

- Project: `d:\code\loaf.github.io`
- Suspect area: VuePress home/blog page generation and article frontmatter parsing

## Hypotheses

1. The homepage blog list filters pages by a frontmatter field shape that this article does not satisfy.
2. Local dev cache/hot reload did not refresh homepage page data after adding the new file.
3. The homepage list uses a different date sorting or publish-state rule, so this page is excluded even though the section page shows it.
4. The page is indexed into the category archive but not into the homepage article collection because of plugin/theme metadata normalization differences.
5. Another rendering/runtime error on the homepage data pipeline prevents this one page from being included.

## Plan

1. Reproduce locally.
2. Instrument runtime/page data collection without changing business logic.
3. Compare homepage data vs. essay archive data.
4. Confirm root cause from evidence.
5. Apply minimal fix and verify.
