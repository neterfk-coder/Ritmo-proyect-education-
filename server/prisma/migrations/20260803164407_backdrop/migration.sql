-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alias" TEXT NOT NULL,
    "ageBand" TEXT NOT NULL DEFAULT 'middle',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identifiesAs" TEXT,
    "defaultFormat" TEXT NOT NULL DEFAULT 'skeleton',
    "readingTheme" TEXT NOT NULL DEFAULT 'calm',
    "readingTint" TEXT NOT NULL DEFAULT 'none',
    "letterSpacing" REAL NOT NULL DEFAULT 0,
    "lineHeight" REAL NOT NULL DEFAULT 1.7,
    "showStepCount" BOOLEAN NOT NULL DEFAULT false,
    "soundOn" BOOLEAN NOT NULL DEFAULT false,
    "companionOn" BOOLEAN NOT NULL DEFAULT true,
    "backdropOn" BOOLEAN NOT NULL DEFAULT true,
    "onboarded" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Student" ("ageBand", "alias", "companionOn", "createdAt", "defaultFormat", "id", "identifiesAs", "letterSpacing", "lineHeight", "onboarded", "readingTheme", "readingTint", "showStepCount", "soundOn") SELECT "ageBand", "alias", "companionOn", "createdAt", "defaultFormat", "id", "identifiesAs", "letterSpacing", "lineHeight", "onboarded", "readingTheme", "readingTint", "showStepCount", "soundOn" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
