import fs from 'fs';
import path from 'path';

const PROVINCES_URL = "https://huynhminhvangit.github.io/vn-region-api/data/provinces.json";

// Mapping 63 tỉnh thành vào 3 miền
const REGION_MAPPING = {
  north: ["01", "02", "04", "06", "08", "10", "11", "12", "14", "15", "17", "19", "20", "22", "24", "25", "26", "27", "30", "31", "33", "34", "35", "36", "37"],
  central: ["38", "40", "42", "44", "45", "46", "48", "49", "51", "52", "54", "56", "58", "60", "62", "64", "66", "67", "68"],
  south: ["70", "72", "74", "75", "77", "79", "80", "82", "83", "84", "86", "87", "89", "91", "92", "93", "94", "95", "96"]
};

function normalizeProvinceName(name = "") {
  return name
    .replace(/^(Thành phố trực thuộc trung ương)\s+/i, "")
    .replace(/^(Thành phố|Tỉnh)\s+/i, "")
    .trim();
}

async function syncProvinces() {
  console.log("🚀 Đang đồng bộ dữ liệu tỉnh thành Việt Nam...");
  
  try {
    const response = await fetch(PROVINCES_URL);
    const rawData = await response.json();
    
    const normalizedProvinces = rawData.map(p => {
      let region = "other";
      if (REGION_MAPPING.north.includes(p.code)) region = "north";
      else if (REGION_MAPPING.central.includes(p.code)) region = "central";
      else if (REGION_MAPPING.south.includes(p.code)) region = "south";
      
      return {
        code: p.code,
        name: normalizeProvinceName(p.name),
        slug: p.slug,
        type: p.type,
        country: "VN",
        region: region
      };
    });

    const dir = path.join(process.cwd(), 'apps/web/data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      path.join(dir, 'vn-provinces.json'),
      JSON.stringify(normalizedProvinces, null, 2),
      'utf-8'
    );

    console.log(`✅ Đã đồng bộ ${normalizedProvinces.length} tỉnh thành vào apps/web/data/vn-provinces.json`);
  } catch (error) {
    console.error("❌ Lỗi đồng bộ:", error);
  }
}

syncProvinces();
