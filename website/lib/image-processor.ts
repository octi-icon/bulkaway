import sharpModule from 'sharp';
import type { SharpConstructor } from 'sharp-types';
// Vinext declares optional sharp imports as unknown. Use the installed library's
// own types through a type-only alias without modifying framework dependencies.
export const sharp = sharpModule as SharpConstructor;
