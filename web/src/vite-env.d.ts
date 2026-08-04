/// <reference types="vite/client" />

// Brings in Vite's own module declarations, which is what makes suffixed
// imports like `?url` and `?raw` typed rather than errors. The PDF worker is
// loaded that way — see lib/pdf.ts.
