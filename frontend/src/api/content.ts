import axios from './axios'; // Using your existing configured axios instance

// 1. Define the shape of the "About" page data
// This must match exactly what we put in the database!
export interface AboutPageData {
  hero: {
    title: string;
    subtitle: string;
  };
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  history: string;
  team: Array<{
    name: string;
    role: string;
    image?: string; // Optional
  }>;
}

// ... existing AboutPageData ...

// Add this NEW interface
export interface HomePageData {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    image?: string; // We added this earlier
  };
  stats: Array<{
    label: string;
    value: string;
    image?: string; // <--- ADD THIS (Optional image/icon)
  }>;
  features: Array<{
    title: string;
    description: string;
    image?: string; // <--- ADD THIS (Card thumbnail)
  }>;
}

// ... existing interfaces ...

export interface ContactPageData {
  info: {
    address: string;
    email: string;
    phone: string;
    workingHours: string;
  };
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin?: string;
  };
}

// 2. Fetch Function (Public)
export const getPageContent = async (pageKey: string) => {
  const response = await axios.get(`/content/${pageKey}`);
  return response.data;
};

// 3. Update Function (Admin Only)
export const updatePageContent = async (pageKey: string, content: any) => {
  const response = await axios.put(`/content/${pageKey}`, content);
  return response.data;
};

