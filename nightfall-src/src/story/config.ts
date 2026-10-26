/**
 * Configuration for the /story editorial edition.
 *
 * NOTE FOR THE USER:
 * To swap the placeholder avatar with a high-res photo, replace the path below
 * or drop your high-res file into public/images/profile/ and update PORTRAIT_SRC.
 */
export const PORTRAIT_SRC = '/nightfall/images/profile/nishant_avatar.jpg';

export interface StorySectionDef {
  id: string;
  label: string;
  num: string;
}

export const STORY_SECTIONS: StorySectionDef[] = [
  { id: 'hero', label: 'OVERVIEW', num: '01' },
  { id: 'work', label: 'WORK', num: '02' },
  { id: 'about', label: 'ABOUT', num: '03' },
  { id: 'skills', label: 'SKILLS', num: '04' },
  { id: 'record', label: 'RECORD', num: '05' },
  { id: 'hire', label: 'COLLABORATE', num: '06' },
];
