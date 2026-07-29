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
}

export interface Nation {
  name: string;
  tagline: string;
  colorKey: string;
}

export interface Organization {
  name: string;
  tagline: string;
  colorKey: string;
}

export interface Religion {
  name: string;
  tagline: string;
  colorKey: string;
}

export interface Section {
  id: string;
  label: string;
}
