-- CreateTable
CREATE TABLE "CriticalCaseFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "flaggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unflaggedAt" DATETIME,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FLAGGED',
    "auto" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CriticalCaseFlag_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CriticalCaseFlag_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
