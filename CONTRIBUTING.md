# Contribute to The Unstarred Museum

Welcome to the Department of Highly Specific Software.

We collect public GitHub projects that have **0–5 stars at the time of discovery** and something wonderful, puzzling, comically specific, or unexpectedly ingenious about them. A tiny project can be a joke, a sketch, a serious niche utility, a half-finished game, or one determined line of code.

## How to nominate a specimen

1. Find a public GitHub repository with 0–5 stars.
2. **Open the code.** Identify at least one actual file that explains what makes the project interesting. A funny name is a start; a great source-file discovery earns the exhibit.
3. [Open a specimen nomination issue](../../issues/new?template=nominate-a-specimen.yml) after this archive is hosted on GitHub. Include the repo URL, discovery-day star count, a source file link, and a brief field note.
4. Or submit a pull request that adds an entry to `data/exhibits.json`.

The museum preserves the **star count at discovery**. A project that later earns a hundred stars retains its original entry, because history is delightful.

## A good field note

Say what the project actually does or attempts to do. Mention one detail you verified from the source. Keep the joke aimed at the software's premise. Give its author their due. Link to the original.

We avoid personal ridicule, harassment, private data, stolen code collections, malware samples, suspicious download traps, and spam repositories made in bulk. We celebrate hobbyists, prototypes, and works-in-progress.

## Adding an entry

Append an object to `data/exhibits.json`, using the previous entry as a template. Use the next sequential ID (`UM-015`, etc.) and an existing department:

- `Self-Defeating Software`
- `Pure Nothing`
- `Creature Features`
- `Digital Relics`
- `Elaborate Side Quests`

Keep the original source excerpt short. Record `discovered_on`, `created_on`, and the GitHub `updated_at` date you observed under `last_updated_at_discovery`. Include `stars_at_discovery` and `forks_at_discovery` as numbers. An exhibit's `evidence.url` should link to the exact original file you inspected.

Run the included checker before submitting:

```bash
python3 scripts/check_catalog.py
```

It also runs in GitHub Actions when the catalog changes. The site reads the JSON directly, so your entry appears automatically in the archive.

## Notes on credit and permanence

Each card links to the source repository and the specific file behind the field note. The museum does not distribute copies of the authors' projects. Their code remains under the authors' own licenses. Repositories may be deleted, renamed, or privatized; keep the recorded name and source link intact, and flag broken links in an issue.

**Curiosity, affection, receipts.** That's the whole editorial policy.
