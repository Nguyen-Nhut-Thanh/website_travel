import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Chúng ta sử dụng client-side authentication (localStorage) cho Admin
  // Nên không cần check cookie ở middleware nữa để tránh lỗi redirect loop
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
