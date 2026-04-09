# Travel V2

Travel V2 là hệ thống đặt tour du lịch gồm 3 thành phần:

- `apps/api`: backend NestJS + Prisma
- `apps/web`: giao diện người dùng và quản trị bằng Next.js
- `apps/ai`: dịch vụ AI cho chatbot và hệ gợi ý bằng FastAPI

## Biến môi trường

Sao chép các file mẫu sau và điền key của bạn vào:

- `apps/api/.env.example` -> `apps/api/.env`
- `apps/web/.env.example` -> `apps/web/.env.local`
- `apps/ai/.env.example` -> `apps/ai/.env`

Các biến quan trọng:

- API: `DATABASE_URL`, `MONGODB_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CLOUDINARY_*`, `MAIL_*`, `VNP_*`
- Web: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_AI_BASE`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- AI: `OPENAI_API_KEY`, `POSTGRES_URL`, `MONGODB_URL`, `CORS_ORIGINS`

## Cài đặt

### 1. Cài thư viện

Chạy ở thư mục gốc:

```bash
npm install
```

Với AI service, cài thêm thư viện Python:

```bash
cd apps/ai
pip install -r requirements.txt
```

### 2. Đổ dữ liệu / khởi tạo CSDL

Sau khi cấu hình xong `.env`, chạy các lệnh import/seed cần dùng ở `apps/api`:

Tạo Prisma Client:

````bash
cd apps/api
npx prisma generate

```bash
npm run location:locations -w api
npm run seed:hotels-transports -w api
npm run seed:recommendation-tours -w api
````

Nếu muốn cấp quyền admin cho một tài khoản:

```bash
npm.cmd run grant:admin -w api -- email@example.com
```

Sau đó tạo Prisma Client:

```bash
cd apps/api
npx prisma generate
```

## Chạy hệ thống

Chạy toàn bộ dự án:

```bash
npm run dev
```

Hoặc chạy từng phần:

```bash
npm run dev:api
npm run dev:web
npm run dev:ai
```

Mặc định:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- AI: `http://localhost:8000`
