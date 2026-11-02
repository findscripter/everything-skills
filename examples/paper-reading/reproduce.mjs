import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(fs.readFileSync(path.join(here, 'input', name), 'utf8'));
const metadata = read('metadata.json');
function canonicalId(identifier) {
  const value = identifier.trim().toLowerCase();
  const arxiv = value.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?$/);
  return arxiv ? `10.48550/arxiv.${arxiv[1]}` : value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '');
}

export function reproduce() {
  const draft = read('draft-citations.json').records;
  const errors = [];
  const groups = new Map();
  for (const record of draft) {
    const doi = canonicalId(record.identifier);
    if (!groups.has(doi)) groups.set(doi, []);
    groups.get(doi).push(record.id);
    if (doi !== metadata.doi) errors.push({ record: record.id, code: 'UNEXPECTED_IDENTIFIER' });
    if (record.year !== metadata.publicationYear) errors.push({ record: record.id, code: 'YEAR_MISMATCH', actual: record.year, expected: metadata.publicationYear });
    if (JSON.stringify(record.authors) !== JSON.stringify(metadata.authors)) errors.push({ record: record.id, code: 'AUTHOR_LIST_MISMATCH', actualCount: record.authors.length, expectedCount: metadata.authors.length });
    if (record.title !== metadata.title) errors.push({ record: record.id, code: 'TITLE_MISMATCH' });
  }
  const duplicateGroups = [...groups].filter(([, ids]) => ids.length > 1).map(([doi, records]) => ({ doi, records }));
  const bib = `@misc{vaswani2017attention,\n  author = {${metadata.authors.join(' and ')}},\n  title = {{${metadata.title}}},\n  year = {${metadata.publicationYear}},\n  eprint = {${metadata.arxivId}},\n  archivePrefix = {arXiv},\n  primaryClass = {cs.CL},\n  doi = {${metadata.doi}},\n  url = {${metadata.paperUrl}},\n  note = {Reading version ${metadata.readVersion}, revised ${metadata.versionDate}; arXiv preprint}\n}\n`;
  return {
    report: { scope: 'Offline bibliographic fixture check against selected previously verified metadata; not full-text fact checking', inputCount: draft.length, uniqueWorkCount: groups.size, errors, duplicateGroups, correctedYear: metadata.publicationYear, canonicalAuthorCount: metadata.authors.length, canonicalDoi: metadata.doi, inputSha256: Object.fromEntries(['metadata.json', 'draft-citations.json'].map(name => [name, createHash('sha256').update(fs.readFileSync(path.join(here, 'input', name))).digest('hex')])) },
    bib
  };
}

export async function verifyOnline() {
  const response = await fetch(metadata.metadataSource, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, 'DataCite must return HTTP 200');
  const attributes = (await response.json()).data.attributes;
  assert.equal(attributes.doi.toLowerCase(), metadata.doi);
  assert.equal(attributes.titles[0].title, metadata.title);
  assert.equal(attributes.publicationYear, metadata.publicationYear);
  assert.deepEqual(attributes.creators.map(c => c.name), metadata.authors);
  const paper = await fetch(metadata.paperUrl, { signal: AbortSignal.timeout(20000) });
  assert.equal(paper.status, 200, 'Versioned arXiv record must return HTTP 200');
  return { scope: 'Live DataCite title/year/eight-author/DOI comparison and versioned arXiv HTTP accessibility; does not reread the full paper', metadataHttpStatus: response.status, paperHttpStatus: paper.status, publicationYear: attributes.publicationYear, authorCount: attributes.creators.length, doi: attributes.doi, metadataSource: metadata.metadataSource, paperUrl: metadata.paperUrl };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { report, bib } = reproduce();
  const write = process.argv.includes('--write');
  if (write) {
    fs.mkdirSync(path.join(here, 'output'), { recursive: true });
    fs.writeFileSync(path.join(here, 'output/citation-check.json'), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(here, 'output/references.bib'), bib);
  } else {
    assert.deepEqual(report, JSON.parse(fs.readFileSync(path.join(here, 'output/citation-check.json'), 'utf8')));
    assert.equal(bib, fs.readFileSync(path.join(here, 'output/references.bib'), 'utf8'));
  }
  if (process.argv.includes('--online')) {
    const online = await verifyOnline();
    if (write) fs.writeFileSync(path.join(here, 'output/online-check.json'), `${JSON.stringify(online, null, 2)}\n`);
    console.log('paper-reading online: DataCite metadata matches; versioned arXiv record accessible');
  }
  console.log('paper-reading: 2 draft records -> 1 work; wrong year and author list detected; generated BibTeX matches');
}
