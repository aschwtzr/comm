// @flow

import { pluralize } from './text-utils.js';

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
