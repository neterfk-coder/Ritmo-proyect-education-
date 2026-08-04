-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rendering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'en',
    "body" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rendering_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rendering" ("body", "createdAt", "format", "id", "taskId", "wordCount") SELECT "body", "createdAt", "format", "id", "taskId", "wordCount" FROM "Rendering";
DROP TABLE "Rendering";
ALTER TABLE "new_Rendering" RENAME TO "Rendering";
CREATE UNIQUE INDEX "Rendering_taskId_format_lang_key" ON "Rendering"("taskId", "format", "lang");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
