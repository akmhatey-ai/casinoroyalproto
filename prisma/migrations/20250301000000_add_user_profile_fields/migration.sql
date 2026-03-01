-- AlterTable: add profile fields to users (username already exists)
ALTER TABLE "users" ADD COLUMN "bio" TEXT;
ALTER TABLE "users" ADD COLUMN "website" TEXT;
ALTER TABLE "users" ADD COLUMN "twitter" TEXT;
ALTER TABLE "users" ADD COLUMN "github" TEXT;
ALTER TABLE "users" ADD COLUMN "profile_public" BOOLEAN NOT NULL DEFAULT true;
