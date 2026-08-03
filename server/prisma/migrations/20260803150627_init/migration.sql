-- CreateTable
CREATE TABLE "Student" (
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
    "onboarded" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "LearningProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "directives" TEXT NOT NULL DEFAULT '[]',
    "fastestFormat" TEXT,
    "bestBlockMinutes" INTEGER,
    "medianFirstActionMs" INTEGER,
    "frictionThreshold" REAL NOT NULL DEFAULT 0.62,
    "sessionsAnalysed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "timesOffered" INTEGER NOT NULL DEFAULT 0,
    "timesTaken" INTEGER NOT NULL DEFAULT 0,
    "timesHelped" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Intervention_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'paste',
    "subject" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Decomposition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "hiddenVerb" TEXT NOT NULL,
    "plainAsk" TEXT NOT NULL,
    "definitionOfDone" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "trapWarnings" TEXT NOT NULL DEFAULT '[]',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 20,
    "model" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Decomposition_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MicroStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decompositionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "decisionFree" BOOLEAN NOT NULL DEFAULT true,
    "estimatedSeconds" INTEGER NOT NULL DEFAULT 120,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "MicroStep_decompositionId_fkey" FOREIGN KEY ("decompositionId") REFERENCES "Decomposition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rendering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rendering_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "firstActionMs" INTEGER,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "stepsCompleted" INTEGER NOT NULL DEFAULT 0,
    "formatUsed" TEXT,
    "readingRateWpm" REAL,
    "outcome" TEXT NOT NULL DEFAULT 'open',
    CONSTRAINT "Session_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Session_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "wpm" REAL NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingSample_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FrictionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "topSignal" TEXT NOT NULL,
    "offered" BOOLEAN NOT NULL DEFAULT false,
    "chosenKey" TEXT,
    "recoveredMs" INTEGER,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FrictionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'teacher',
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileExport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningProfile_studentId_key" ON "LearningProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_studentId_key_key" ON "Intervention"("studentId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Decomposition_taskId_key" ON "Decomposition"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "Rendering_taskId_format_key" ON "Rendering"("taskId", "format");
