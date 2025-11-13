import { create } from 'zustand';

const initialState = {
  brandName: 'Documotion',
  tagline: 'Built-in concierge for Indian founders',
  primaryColor: '#3A7DFF',
  secondaryColor: '#111827',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  logos: [],
  productImages: [],
  versions: [],
  suggestions: [],
};

export const useBrandingStudioStore = create(set => ({
  ...initialState,
  setBrandName: brandName => set({ brandName }),
  setTagline: tagline => set({ tagline }),
  setPrimaryColor: primaryColor => set({ primaryColor }),
  setSecondaryColor: secondaryColor => set({ secondaryColor }),
  setFonts: fonts => set(state => ({ fonts: { ...state.fonts, ...fonts } })),
  addLogo: logo =>
    set(state => ({
      logos: [...state.logos, logo],
    })),
  removeLogo: index =>
    set(state => ({
      logos: state.logos.filter((_, idx) => idx !== index),
    })),
  addProductImage: image =>
    set(state => ({
      productImages: [...state.productImages, image],
    })),
  removeProductImage: index =>
    set(state => ({
      productImages: state.productImages.filter((_, idx) => idx !== index),
    })),
  pushVersion: snapshot =>
    set(state => ({
      versions: [
        {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          snapshot,
        },
        ...state.versions,
      ],
    })),
  setSuggestions: suggestions => set({ suggestions }),
  resetBrand: () => set(initialState),
}));
