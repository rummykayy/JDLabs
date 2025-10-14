// This file is used to declare global TypeScript types that augment existing interfaces.
// Importing it for its side effects in index.tsx ensures these declarations are
// picked up by the TypeScript compiler/esbuild.

declare global {
  // Augmenting the built-in MediaTrackConstraints to include the `cursor` property,
  // which is a standard part of the Screen Capture API but may be missing from
  // older TypeScript DOM library versions. This is used in the `useScreenShare` hook.
  interface MediaTrackConstraintSet {
    cursor?: 'always' | 'motion' | 'never';
  }
}

// Adding an empty export statement to satisfy the --isolatedModules compiler option
// and ensure this file is treated as a module.
export {};
