/**
 * Immer configuration for client-side usage
 * This file must be imported early in the client-side bundle to enable
 * Map and Set support in Immer middleware (used by Zustand stores)
 */
import { enableMapSet } from 'immer';

// Enable Immer support for Map and Set data structures
enableMapSet();
