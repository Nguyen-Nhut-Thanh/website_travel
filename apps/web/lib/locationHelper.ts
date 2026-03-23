import provinces from '../data/vn-provinces.json';
import attractions from '../data/vn-attractions.json';

export const VN_REGIONS = [
  { id: 'north', name: 'Miền Bắc' },
  { id: 'central', name: 'Miền Trung' },
  { id: 'south', name: 'Miền Nam' }
];

export const getProvincesByRegion = (regionId: string) => {
  return provinces.filter(p => p.region === regionId);
};

export const getAllProvinces = () => {
  return provinces;
};

export const getAttractionsByProvince = (provinceCode: string) => {
  const provinceAttractions = attractions.find(a => a.provinceCode === provinceCode);
  return provinceAttractions ? provinceAttractions.attractions : [];
};

export const getProvinceByCode = (code: string) => {
  return provinces.find(p => p.code === code);
};

export const getRegionById = (id: string) => {
  return VN_REGIONS.find(r => r.id === id);
};
