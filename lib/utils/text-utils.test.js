// @flow

import { pluralize, trimText } from './text-utils.js';

test('pluralize', () => {
  expect(pluralize([])).toBe('');

  expect(pluralize(['a'])).toBe('a');
  expect(pluralize(['a', 'b'])).toBe('a and b');
  expect(pluralize(['a', 'b', 'c'])).toBe('a, b, and c');
  expect(pluralize(['a', 'b', 'c', 'd'])).toBe('a, b, and 2 others');

  expect(pluralize(['cat', 'dog', 'sheep'], 3)).toBe('cat, dog, and sheep');
  expect(pluralize(['cat', 'dog', 'sheep'], 2)).toBe('cat and 2 others');
  expect(pluralize(['cat', 'dog', 'sheep'], 1)).toBe('3 users');
  expect(pluralize(['cat', 'dog', 'sheep'], 0)).toBe('');

  expect(pluralize(['cat', 'dog', 'sheep', 'moose'])).toBe(
    'cat, dog, and 2 others',
  );
  expect(pluralize(['cat', 'dog', 'sheep', 'moose'], 5)).toBe(
    'cat, dog, sheep, and moose',
  );
});

test('trimText', () => {
  expect(trimText('', 0)).toBe('');
  expect(trimText('', 1)).toBe('');
  expect(trimText('', 2)).toBe('');
  expect(trimText('', 3)).toBe('');
  expect(trimText('', 4)).toBe('');

  expect(trimText('a', 0)).toBe('');
  expect(trimText('a', 0).length).toBeLessThanOrEqual(0);
  expect(trimText('a', 1)).toBe('a');
  expect(trimText('a', 1).length).toBeLessThanOrEqual(1);
  expect(trimText('a', 2)).toBe('a');
  expect(trimText('a', 2).length).toBeLessThanOrEqual(2);
  expect(trimText('a', 3)).toBe('a');
  expect(trimText('a', 3).length).toBeLessThanOrEqual(3);
  expect(trimText('a', 4)).toBe('a');
  expect(trimText('a', 4).length).toBeLessThanOrEqual(4);

  expect(trimText('ab', 0)).toBe('');
  expect(trimText('ab', 0).length).toBeLessThanOrEqual(0);
  expect(trimText('ab', 1)).toBe('a');
  expect(trimText('ab', 1).length).toBeLessThanOrEqual(1);
  expect(trimText('ab', 2)).toBe('ab');
  expect(trimText('ab', 2).length).toBeLessThanOrEqual(2);
  expect(trimText('ab', 3)).toBe('ab');
  expect(trimText('ab', 3).length).toBeLessThanOrEqual(3);
  expect(trimText('ab', 4)).toBe('ab');
  expect(trimText('ab', 4).length).toBeLessThanOrEqual(4);

  expect(trimText('abc', 0)).toBe('');
  expect(trimText('abc', 0).length).toBeLessThanOrEqual(0);
  expect(trimText('abc', 1)).toBe('a');
  expect(trimText('abc', 1).length).toBeLessThanOrEqual(1);
  expect(trimText('abc', 2)).toBe('ab');
  expect(trimText('abc', 2).length).toBeLessThanOrEqual(2);
  expect(trimText('abc', 3)).toBe('abc');
  expect(trimText('abc', 3).length).toBeLessThanOrEqual(3);
  expect(trimText('abc', 4)).toBe('abc');
  expect(trimText('abc', 4).length).toBeLessThanOrEqual(4);

  expect(trimText('the quick brown fox jumps', 0)).toBe('');
  expect(trimText('the quick brown fox jumps', 1)).toBe('t');
  expect(trimText('the quick brown fox jumps', 2)).toBe('th');
  expect(trimText('the quick brown fox jumps', 3)).toBe('the');
  expect(trimText('the quick brown fox jumps', 4)).toBe('t...');
  expect(trimText('the quick brown fox jumps', 25)).toBe(
    'the quick brown fox jumps',
  );
  expect(trimText('the quick brown fox jumps', 400)).toBe(
    'the quick brown fox jumps',
  );
});
