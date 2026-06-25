export interface Race {
  name: string;
  tagline: string;
  colorKey: string;
  blurb: string;
}

export interface Specialty {
  name: string;
  icon: string;
  colorKey: string;
  category: 'magical' | 'profession';
  restriction?: string;
  description: string;
}

export interface Nation {
  name: string;
  tagline: string;
  colorKey: string;
  description: string;
}

export interface Organization {
  name: string;
  tagline: string;
  colorKey: string;
  description: string;
}

export interface Section {
  id: string;
  label: string;
}
