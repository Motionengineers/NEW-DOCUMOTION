import create from 'zustand';

const initialState = {
  name: 'Acme Co',
  tagline: 'Innovate the future',
  primaryColor: '#3A7DFF',
  accentColor: '#111827',
  logos: [],
};

const useBrandStore = create(set => ({
  brand: initialState,
  setBrand: updates => set(state => ({ brand: { ...state.brand, ...updates } })),
  setLogos: logos => set(state => ({ brand: { ...state.brand, logos } })),
}));

export default useBrandStore;
