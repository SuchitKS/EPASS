/*
  # Fix Foreign Key Constraints with ON DELETE CASCADE

  This migration fixes the foreign key constraints to allow proper deletion of records
  by adding ON DELETE CASCADE behavior to all foreign key relationships.

  ## Changes Made

  1. **Student Table Dependencies**
     - Drop and recreate foreign keys in `participant`, `volunteer`, `event`, `club`, and `memberof` tables
     - Add `ON DELETE CASCADE` to automatically delete dependent records when a student is deleted

  2. **Event Table Dependencies**
     - Drop and recreate foreign keys in `participant` and `volunteer` tables
     - Add `ON DELETE CASCADE` to automatically delete participants/volunteers when an event is deleted

  3. **Club Table Dependencies**
     - Drop and recreate foreign keys in `event` and `memberof` tables
     - Add `ON DELETE CASCADE` to automatically handle club deletions

  ## Security
  - All existing RLS policies remain unchanged
  - This only affects referential integrity behavior, not access control

  ## Important Notes
  - This enables cascading deletes, so deleting a student will also delete their participations, volunteering records, organized events, and club memberships
  - This is the expected behavior for a student management system
*/

-- First, drop all existing foreign key constraints that need to be modified

-- Drop foreign keys from participant table
ALTER TABLE participant DROP CONSTRAINT IF EXISTS participant_partusn_fkey;
ALTER TABLE participant DROP CONSTRAINT IF EXISTS participant_parteid_fkey;

-- Drop foreign keys from volunteer table
ALTER TABLE volunteer DROP CONSTRAINT IF EXISTS volunteer_volnusn_fkey;
ALTER TABLE volunteer DROP CONSTRAINT IF EXISTS volunteer_volneid_fkey;

-- Drop foreign keys from event table
ALTER TABLE event DROP CONSTRAINT IF EXISTS event_orgusn_fkey;
ALTER TABLE event DROP CONSTRAINT IF EXISTS event_orgcid_fkey;

-- Drop foreign keys from club table
ALTER TABLE club DROP CONSTRAINT IF EXISTS club_clubprezusn_fkey;

-- Drop foreign keys from memberof table
ALTER TABLE memberof DROP CONSTRAINT IF EXISTS memberof_studentusn_fkey;
ALTER TABLE memberof DROP CONSTRAINT IF EXISTS memberof_clubid_fkey;

-- Now recreate all foreign key constraints with proper ON DELETE CASCADE behavior

-- Participant table foreign keys
ALTER TABLE participant 
ADD CONSTRAINT participant_partusn_fkey 
FOREIGN KEY (partusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE participant 
ADD CONSTRAINT participant_parteid_fkey 
FOREIGN KEY (parteid) REFERENCES event(eid) ON DELETE CASCADE;

-- Volunteer table foreign keys
ALTER TABLE volunteer 
ADD CONSTRAINT volunteer_volnusn_fkey 
FOREIGN KEY (volnusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE volunteer 
ADD CONSTRAINT volunteer_volneid_fkey 
FOREIGN KEY (volneid) REFERENCES event(eid) ON DELETE CASCADE;

-- Event table foreign keys
ALTER TABLE event 
ADD CONSTRAINT event_orgusn_fkey 
FOREIGN KEY (orgusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE event 
ADD CONSTRAINT event_orgcid_fkey 
FOREIGN KEY (orgcid) REFERENCES club(cid) ON DELETE SET NULL;

-- Club table foreign keys
ALTER TABLE club 
ADD CONSTRAINT club_clubprezusn_fkey 
FOREIGN KEY (clubprezusn) REFERENCES student(usn) ON DELETE SET NULL;

-- Memberof table foreign keys
ALTER TABLE memberof 
ADD CONSTRAINT memberof_studentusn_fkey 
FOREIGN KEY (studentusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE memberof 
ADD CONSTRAINT memberof_clubid_fkey 
FOREIGN KEY (clubid) REFERENCES club(cid) ON DELETE CASCADE;