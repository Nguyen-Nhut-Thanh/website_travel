
import asyncio
from sqlalchemy import text
from app.database import engine

async def seed_knowledge():
    print("--- Seeding Knowledge Base, Vouchers & Detailed Prices ---")
    
    async with engine.connect() as conn:
        # 1. Thêm Voucher mẫu
        await conn.execute(text("""
            INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, usage_limit, start_date, expiry_date, status, updated_at)
            VALUES 
            ('TRAVOL20', 'percentage', 20, 1000000, 100, NOW(), '2026-12-31', 1, NOW()),
            ('XINCHAO500', 'fixed', 500000, 5000000, 50, NOW(), '2026-12-31', 1, NOW())
            ON CONFLICT (code) DO NOTHING
        """))

        # 2. Thêm giá chi tiết cho các tour schedule hiện có
        # Lấy danh sách schedule_id
        res_schedules = await conn.execute(text("SELECT tour_schedule_id, price FROM tour_schedules"))
        schedules = res_schedules.mappings().all()
        
        for s in schedules:
            sid = s['tour_schedule_id']
            base_p = float(s['price'])
            
            # Xóa giá cũ nếu có để seed lại cho chuẩn
            await conn.execute(text("DELETE FROM tour_schedule_prices WHERE tour_schedule_id = :id"), {"id": sid})
            
            # Thêm giá cho 3 loại khách
            prices = [
                ('ADULT', base_p, 'Giá người lớn'),
                ('CHILD', base_p * 0.8, 'Giá trẻ em (80%)'),
                ('INFANT', base_p * 0.3, 'Giá em bé (30%)')
            ]
            
            for ptype, pval, note in prices:
                await conn.execute(text("""
                    INSERT INTO tour_schedule_prices (tour_schedule_id, passenger_type, price, currency, note)
                    VALUES (:sid, :ptype, :price, 'VND', :note)
                """), {"sid": sid, "ptype": ptype, "price": pval, "note": note})

        # 3. Kiến thức địa danh
        result = await conn.execute(text("SELECT location_id, name FROM locations"))
        locations = result.mappings().all()
        
        knowledge_data = {
            "Đà Nẵng": {
                "best_time": "Tháng 2 đến tháng 8 (mùa khô, biển đẹp)",
                "cuisine": "Mì Quảng, Bánh tráng cuốn thịt heo, Chè Liên, Gỏi cá Nam Ô",
                "highlights": "Bà Nà Hills, Cầu Vàng, Bán đảo Sơn Trà, Ngũ Hành Sơn",
                "tags": "biển, nghỉ dưỡng, gia đình"
            },
            "Sapa": {
                "best_time": "Tháng 9 - 11 (mùa lúa chín) hoặc tháng 3 - 5",
                "cuisine": "Thắng cố, Lợn cắp nách, Cá hồi Sapa, Cơm lam",
                "highlights": "Đỉnh Fansipan, Bản Cát Cát, Thung lũng Mường Hoa",
                "tags": "núi, trekking, văn hóa"
            },
            "Phú Quốc": {
                "best_time": "Tháng 11 đến tháng 4 năm sau",
                "cuisine": "Bún quậy, Gỏi cá trích, Rượu sim, Hải sản Hàm Ninh",
                "highlights": "Bãi Sao, Hòn Thơm, VinWonders, Grand World",
                "tags": "biển, luxury, lãng mạn"
            }
        }

        for loc in locations:
            name = loc['name']
            if name in knowledge_data:
                k = knowledge_data[name]
                await conn.execute(text("""
                    INSERT INTO destinations_detail (location_id, best_time, cuisine, highlights, tags, updated_at)
                    VALUES (:id, :bt, :c, :hl, :t, NOW())
                    ON CONFLICT (location_id) DO UPDATE SET
                        best_time = EXCLUDED.best_time,
                        cuisine = EXCLUDED.cuisine,
                        highlights = EXCLUDED.highlights,
                        tags = EXCLUDED.tags,
                        updated_at = NOW()
                """), {
                    "id": loc['location_id'],
                    "bt": k['best_time'],
                    "c": k['cuisine'],
                    "hl": k['highlights'],
                    "t": k['tags']
                })
        
        await conn.commit()
    print("Detailed seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_knowledge())
