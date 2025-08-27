/*
  # Fix Foreign Key Constraints for Cascade Delete

  1. Changes
    - Drop existing foreign key constraints
    - Recreate them with CASCADE delete behavior
    - This allows deletion of students even when referenced in other tables

  2. Security
    - Maintains existing RLS policies
    - No changes to table structure, only constraint behavior
*/

-- Drop existing foreign key constraints that reference student table
ALTER TABLE club DROP CONSTRAINT IF EXISTS club_clubprezusn_fkey;
ALTER TABLE event DROP CONSTRAINT IF EXISTS event_orgusn_fkey;
ALTER TABLE memberof DROP CONSTRAINT IF EXISTS memberof_studentusn_fkey;
ALTER TABLE participant DROP CONSTRAINT IF EXISTS participant_partusn_fkey;
ALTER TABLE volunteer DROP CONSTRAINT IF EXISTS volunteer_volnusn_fkey;

-- Recreate foreign key constraints with CASCADE delete
ALTER TABLE club 
ADD CONSTRAINT club_clubprezusn_fkey 
FOREIGN KEY (clubprezusn) REFERENCES student(usn) ON DELETE SET NULL;

ALTER TABLE event 
ADD CONSTRAINT event_orgusn_fkey 
FOREIGN KEY (orgusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE memberof 
ADD CONSTRAINT memberof_studentusn_fkey 
FOREIGN KEY (studentusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE participant 
ADD CONSTRAINT participant_partusn_fkey 
FOREIGN KEY (partusn) REFERENCES student(usn) ON DELETE CASCADE;

ALTER TABLE volunteer 
ADD CONSTRAINT volunteer_volnusn_fkey 
FOREIGN KEY (volnusn) REFERENCES student(usn) ON DELETE CASCADE;

-- Keep other foreign key constraints as they were
ALTER TABLE event 
ADD CONSTRAINT event_orgcid_fkey 
FOREIGN KEY (orgcid) REFERENCES club(cid) ON DELETE SET NULL;

ALTER TABLE memberof 
ADD CONSTRAINT memberof_clubid_fkey 
FOREIGN KEY (clubid) REFERENCES club(cid) ON DELETE CASCADE;

ALTER TABLE participant 
ADD CONSTRAINT participant_parteid_fkey 
FOREIGN KEY (parteid) REFERENCES event(eid) ON DELETE CASCADE;

ALTER TABLE volunteer 
ADD CONSTRAINT volunteer_volneid_fkey 
FOREIGN KEY (volneid) REFERENCES event(eid) ON DELETE CASCADE;