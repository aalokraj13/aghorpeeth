import test from 'node:test';
import assert from 'node:assert/strict';
import { AGHOR_VANIS, DHARMA_SAHITYA, INITIAL_SANKALPS } from '../data/ashramData';
import {
  advanceMalaBead,
  calculateReadingProgress,
  filterGranths,
  filterVanis,
  formatTimerSeconds,
  mapVaniCategoryToSankalpCategory,
  parsePersistedState,
  pickRandomInspiringVani,
  validateJigyasaInput,
  validateSankalpInput,
  validateSevaPledge,
} from './ashramLogic';

test('filterVanis filters by category and Devanagari query', () => {
  const all = filterVanis(AGHOR_VANIS, 'सभी', '');
  assert.equal(all.length, AGHOR_VANIS.length);

  const samataOnly = filterVanis(AGHOR_VANIS, 'समता', '');
  assert.ok(samataOnly.length >= 2);
  assert.ok(samataOnly.every((v) => v.category === 'समता'));

  const searchMatches = filterVanis(AGHOR_VANIS, 'सभी', 'मौन');
  assert.ok(searchMatches.length >= 1);
  assert.ok(searchMatches.some((v) => v.id === 'vani-4'));

  const noMatch = filterVanis(AGHOR_VANIS, 'सेवा', 'गैरमौजूदशब्द');
  assert.equal(noMatch.length, 0);
});

test('filterGranths filters sacred texts accurately', () => {
  const all = filterGranths(DHARMA_SAHITYA, 'सभी', '');
  assert.equal(all.length, DHARMA_SAHITYA.length);

  const sadhana = filterGranths(DHARMA_SAHITYA, 'साधना विधि', '');
  assert.equal(sadhana.length, 1);
  assert.equal(sadhana[0].id, 'granth-sadhana');

  const byChapterText = filterGranths(DHARMA_SAHITYA, 'सभी', 'रुद्राक्ष');
  assert.equal(byChapterText.length, 1);
});

test('advanceMalaBead increments and rolls over cleanly at 108', () => {
  const step1 = advanceMalaBead(0, 0);
  assert.deepEqual(step1, { beadCount: 1, completedMalas: 0, justCompletedMala: false });

  const step107 = advanceMalaBead(106, 2);
  assert.deepEqual(step107, { beadCount: 107, completedMalas: 2, justCompletedMala: false });

  const rollover = advanceMalaBead(107, 2);
  assert.deepEqual(rollover, { beadCount: 0, completedMalas: 3, justCompletedMala: true });
});

test('formatTimerSeconds formats MM:SS cleanly including edge values', () => {
  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(65), '01:05');
  assert.equal(formatTimerSeconds(600), '10:00');
  assert.equal(formatTimerSeconds(-5), '00:00');
});

test('calculateReadingProgress computes clamped chapter percentage', () => {
  assert.equal(calculateReadingProgress(0, 3), 33);
  assert.equal(calculateReadingProgress(2, 3), 100);
  assert.equal(calculateReadingProgress(0, 0), 0);
});

test('form validators reject empty/short inputs and accept valid Hindi text', () => {
  assert.equal(validateSankalpInput('   ').valid, false);
  assert.equal(validateSankalpInput('अ').valid, false);
  assert.equal(validateSankalpInput('नित्य १० मिनट ध्यान').valid, true);

  assert.equal(validateSevaPledge('', 'seva-annakshetra').valid, false);
  assert.equal(validateSevaPledge('आनंद', '').valid, false);
  assert.equal(validateSevaPledge('आनंद', 'seva-annakshetra').valid, true);

  assert.equal(validateJigyasaInput('प्रश्न?', 'क').valid, false);
  assert.equal(validateJigyasaInput('बहुत छोटा', 'सुमन').valid, true);
});

test('parsePersistedState recovers cleanly from corrupt JSON and clamps bounds', () => {
  const recovered = parsePersistedState('{broken-json', INITIAL_SANKALPS);
  assert.equal(recovered.malaBeadCount, 0);
  assert.equal(recovered.sankalps.length, INITIAL_SANKALPS.length);

  const normalized = parsePersistedState(
    JSON.stringify({ malaBeadCount: 999, theme: 'dark', readerFontSize: 40 }),
    INITIAL_SANKALPS
  );
  assert.equal(normalized.malaBeadCount, 0);
  assert.equal(normalized.theme, 'dark');
  assert.equal(normalized.readerFontSize, 18);
});

test('pickRandomInspiringVani picks from database, respects excludeId, and handles empty list', () => {
  assert.equal(pickRandomInspiringVani([]), null);

  const single = pickRandomInspiringVani([AGHOR_VANIS[0]], AGHOR_VANIS[0].id);
  assert.equal(single?.id, AGHOR_VANIS[0].id);

  const picked = pickRandomInspiringVani(AGHOR_VANIS, AGHOR_VANIS[0].id, () => 0);
  assert.ok(picked !== null);
  assert.notEqual(picked.id, AGHOR_VANIS[0].id);
});

test('mapVaniCategoryToSankalpCategory maps Vani topics to valid Sankalp categories', () => {
  assert.equal(mapVaniCategoryToSankalpCategory('सेवा'), 'सेवा');
  assert.equal(mapVaniCategoryToSankalpCategory('साधना'), 'जप');
  assert.equal(mapVaniCategoryToSankalpCategory('वैराग्य'), 'मौन');
  assert.equal(mapVaniCategoryToSankalpCategory('आत्मज्ञान'), 'स्वाध्याय');
});
