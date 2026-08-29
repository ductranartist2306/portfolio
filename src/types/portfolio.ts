export interface NavigationItem {
  id: string;
  label: string;
  targetSlide: number;
}

export interface BrandData {
  name: string;
  shortName: string;
  role: string;
  secondaryTitle: string;
  experienceYears: string;
  bio: string;
  contact: {
    fullName: string;
    role: string;
    address: string;
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
  };
  skills: string[];
}
