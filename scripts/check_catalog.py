#!/usr/bin/env python3
"""Validate the museum's catalog using only the Python standard library."""
from datetime import date
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data' / 'exhibits.json'
CATEGORIES = {
    'Self-Defeating Software',
    'Pure Nothing',
    'Creature Features',
    'Digital Relics',
    'Elaborate Side Quests',
    'Cursed Code',
}
REPO_RE = re.compile(r'^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')


def fail(message):
    print('ERROR:', message, file=sys.stderr)
    sys.exit(1)


def iso_date(text, label):
    if not isinstance(text, str):
        fail(f'{label} must be a date string')
    try:
        return date.fromisoformat(text)
    except (ValueError, TypeError):
        fail(f'{label} must use ISO YYYY-MM-DD: {text!r}')


def main():
    try:
        records = json.loads(SOURCE.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as err:
        fail(f'Cannot read {SOURCE}: {err}')
    if not isinstance(records, list) or not records:
        fail('Catalog must be a nonempty array')
    ids, repos = set(), set()
    for idx, item in enumerate(records, start=1):
        if not isinstance(item, dict):
            fail(f'Entry {idx} must be an object')
        required = [
            'id','repo','name','url','category','tagline','field_note','language',
            'tags','icon','stars_at_discovery','forks_at_discovery',
            'discovered_on','created_on','last_updated_at_discovery','evidence'
        ]
        missing = set(required) - item.keys()
        if missing:
            fail(f'Entry {idx} missing {sorted(missing)}')
        ident, repo = item['id'], item['repo']
        if ident != f'UM-{idx:03d}' or ident in ids:
            fail(f'Entry {idx}: IDs must be unique and ordered UM-001, UM-002, ...')
        ids.add(ident)
        if not isinstance(repo, str) or not REPO_RE.fullmatch(repo) or repo in repos:
            fail(f'{ident}: invalid or duplicate repo {repo!r}')
        repos.add(repo)
        if item['url'] != f'https://github.com/{repo}':
            fail(f'{ident}: URL must match repo')
        if item['category'] not in CATEGORIES:
            fail(f'{ident}: unknown category {item["category"]!r}')
        for key in ['name','tagline','field_note','language','icon']:
            if not isinstance(item[key],str) or not item[key].strip():
                fail(f'{ident}: {key} must be a nonempty string')
        if not isinstance(item['tags'],list) or not item['tags'] or any(not isinstance(t,str) or not t.strip() for t in item['tags']):
            fail(f'{ident}: tags must be nonempty strings')
        for key in ['stars_at_discovery','forks_at_discovery']:
            value = item[key]
            if type(value) is not int or value < 0:
                fail(f'{ident}: {key} must be a nonnegative integer')
        if item['stars_at_discovery'] > 5:
            fail(f'{ident}: museum accepts 0-5 stars at discovery')
        created = iso_date(item['created_on'],f'{ident} created_on')
        discovered = iso_date(item['discovered_on'],f'{ident} discovered_on')
        updated = iso_date(item['last_updated_at_discovery'],f'{ident} last_updated_at_discovery')
        if not (created <= discovered and created <= updated):
            fail(f'{ident}: inconsistent dates')
        ev = item['evidence']
        if not isinstance(ev, dict) or any(k not in ev for k in ('path','url','excerpt')):
            fail(f'{ident}: evidence must include path, url and excerpt')
        if any(not isinstance(ev[k],str) or not ev[k].strip() for k in ('path','url','excerpt')):
            fail(f'{ident}: evidence fields must be nonempty strings')
        if not ev['url'].startswith(f'https://github.com/{repo}/blob/') or f'/{ev["path"]}' not in ev['url']:
            fail(f'{ident}: evidence link must point to a file in the repo')
        if len(ev['excerpt']) > 350:
            fail(f'{ident}: source excerpt is longer than 350 characters')
    print(f'OK: {len(records)} exhibits validated; {len(repos)} unique repositories.')


if __name__ == '__main__':
    main()
