export interface NavItem {
  title: string;
  href: string;
  isMega?: boolean;
  children?: {
    title: string;
    href: string;
    subItems?: { title: string; href: string }[];
  }[];
}

export const navData: NavItem[] = [
  { title: "Trang chủ", href: "/" },
  {
    title: "Điểm đến",
    href: "/tours",
    isMega: true,
    children: [
      {
        title: "Trong nước",
        href: "/tours?type=domestic",
        subItems: [
          { title: "Miền Bắc", href: "/tours?region=north" },
          { title: "Miền Trung", href: "/tours?region=central" },
          { title: "Miền Nam", href: "/tours?region=south" },
        ],
      },
      {
        title: "Ngoài nước",
        href: "/tours?type=international",
        subItems: [
          // Danh sách các quốc gia phổ biến (bạn có thể mở rộng thêm)
          { title: "Thái Lan", href: "/tours?country=Thailand" },
          { title: "Nhật Bản", href: "/tours?country=Japan" },
          { title: "Hàn Quốc", href: "/tours?country=South+Korea" },
          { title: "Singapore", href: "/tours?country=Singapore" },
          { title: "Trung Quốc", href: "/tours?country=China" },
          { title: "Mỹ", href: "/tours?country=USA" },
          { title: "Pháp", href: "/tours?country=France" },
          { title: "Úc", href: "/tours?country=Australia" },
        ],
      },
    ],
  },
  { title: "Bài viết", href: "/blog" },
  { title: "Về chúng tôi", href: "/about" },
];

export const regionsData = {
  north: [
    "Hà Nội", "Hà Giang", "Cao Bằng", "Bắc Kạn", "Tuyên Quang", "Lào Cai", 
    "Điện Biên", "Lai Châu", "Sơn La", "Yên Bái", "Hòa Bình", "Thái Nguyên",
    "Lạng Sơn", "Quảng Ninh", "Bắc Giang", "Phú Thọ", "Vĩnh Phúc", "Bắc Ninh",
    "Hải Dương", "Hải Phòng", "Hưng Yên", "Thái Bình", "Hà Nam", "Nam Định", "Ninh Bình"
  ],
  central: [
    "Đà Nẵng", "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị",
    "Thừa Thiên Huế", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên",
    "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng"
  ],
  south: [
    "Thành phố Hồ Chí Minh", "Bình Phước", "Tây Ninh", "Bình Dương", "Đồng Nai",
    "Bà Rịa - Vũng Tàu", "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh",
    "Vĩnh Long", "Đồng Tháp", "An Giang", "Kiên Giang", "Cần Thơ", "Hậu Giang",
    "Sóc Trăng", "Bạc Liêu", "Cà Mau"
  ]
};

// Danh sách quốc gia phổ biến (trừ Việt Nam)
export const internationalCountries = [
  "Thái Lan", "Nhật Bản", "Hàn Quốc", "Trung Quốc", "Singapore", "Mỹ", "Úc", "Pháp", "Đức", "Anh", "Ý", "Nga", "Canada", "Tây Ban Nha", "Thụy Sĩ", "Ấn Độ", "Indonesia", "Malaysia", "Đài Loan", "Hồng Kông", "Lào", "Campuchia", "Myanmar", "Philippines", "Thổ Nhĩ Kỳ", "Ai Cập", "Brazil", "Mexico", "Nam Phi", "New Zealand"
].sort((a, b) => a.localeCompare(b));
