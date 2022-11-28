import { test, expect } from 'vitest';
import { BitMap24 } from './BitMap24';

test('parseUInt8 shold return 8 if x = -248', (ctx) => {
    expect(BitMap24.parseUInt8(-248)).toEqual(8);
});

test('parseUInt8 shold return 12 if x = -500', (ctx) => {
    expect(BitMap24.parseUInt8(-500)).toEqual(12);
});