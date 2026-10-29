import { Society } from 'src/recruitment/enums/society.enum';

export interface Branding {
  displayName: string; // used in title, signature, footer
  logoFile: string; // relative to /public
  accent: string; // top bar + signature color
  acceptedBadgeBg: string;
  acceptedBadgeText: string;
  fromName?: string; // optional custom sender name
}

export const DEFAULT_BRANDING: Branding = {
  displayName: 'IEEE CUSB',
  logoFile: 'logo.png',
  accent: '#00529b',
  acceptedBadgeBg: '#dcfce7',
  acceptedBadgeText: '#166534',
};

export const SOCIETY_BRANDING: Record<Society, Branding> = {
  [Society.MAIN]: { ...DEFAULT_BRANDING },
  [Society.RAS]: {
    ...DEFAULT_BRANDING,
    displayName: 'RAS IEEE CUSB',
    logoFile: 'logos/RASlogo.png',
    accent: '#960B2C',
    fromName: 'RAS IEEE CUSB',
  },
  [Society.PES]: {
    ...DEFAULT_BRANDING,
    displayName: 'PES IEEE CUSB',
    logoFile: 'logos/PESlogo.png',
    accent: '#559435',
    fromName: 'PES IEEE CUSB',
  },
  [Society.EMBS]: {
    ...DEFAULT_BRANDING,
    displayName: 'EMBS IEEE CUSB',
    logoFile: 'logos/EMBSlogo.png',
    accent: '#7F2C82',
    fromName: 'EMBS IEEE CUSB',
  },
  [Society.CS]: {
    ...DEFAULT_BRANDING,
    displayName: 'CS IEEE CUSB',
    logoFile: 'logos/CSlogo.png',
    accent: '#F79A0F',
    fromName: 'CS IEEE CUSB',
  },
};

export const getBranding = (society?: Society | null): Branding =>
  (society && SOCIETY_BRANDING[society]) || DEFAULT_BRANDING;
