-- Add file URL columns to existing clinical_data table
alter table clinical_data add column image_url text;
alter table clinical_data add column audio_url text;
