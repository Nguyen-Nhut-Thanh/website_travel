import dữ liệu tỉnh thành
npm run location:locations -w api

cấp quyền cho tài khoản thành admin
npm.cmd run grant:admin -w api -- nguyennhutthanh25.2005@gmail.com

cập nhật tỉnh thành cho frontend
node apps/web/scripts/sync-vn-locations.mjs

cập nhật dịch vụ hotel + transport
npm run seed:hotels-transports -w api
