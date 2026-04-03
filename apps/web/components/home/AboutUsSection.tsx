import Link from "next/link";
import {
  Sparkles,
  Wand2,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function AboutUsSection() {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Tour được chọn lọc",
      desc: "Lịch trình rõ ràng, minh bạch, phù hợp mọi nhu cầu.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      title: "Tư vấn thông minh",
      desc: "Gợi ý hành trình theo ngân sách và sở thích cá nhân.",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Hỗ trợ tận tâm",
      desc: "Đồng hành cùng bạn 24/7 trong suốt chuyến đi.",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Trải nghiệm đa dạng",
      desc: "Từ nghỉ dưỡng đến khám phá văn hóa bản địa.",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Cột trái: Nội dung */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[12px] font-black uppercase tracking-[2px]">
                Về chúng tôi
              </span>
              <h2 className="text-[32px] md:text-[42px] font-black text-slate-900 leading-[1.1] tracking-tight">
                Kiến tạo những hành trình <br />
                <span className="text-red-600">diệu kỳ</span> cho riêng bạn
              </h2>
              <p className="text-[16px] text-slate-500 leading-relaxed max-w-xl">
                Chúng tôi không chỉ bán tour, chúng tôi đem đến những trải
                nghiệm sống đáng nhớ. Với hệ thống đặt tour thông minh và đội
                ngũ hỗ trợ tận tâm, Travol cam kết mang lại sự an tâm tuyệt đối
                cho mọi chuyến đi của bạn.
              </p>
            </div>

            {/* Grid lợi ích - Áp dụng DNA thiết kế mới */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={i} className="group flex gap-4 p-2 transition-all">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${f.bg} ${f.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                  >
                    {f.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-slate-800">
                      {f.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 leading-normal">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-[14px] font-bold text-white transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-100 active:scale-95 group"
              >
                <span>Khám phá thêm về Travol</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Background elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-50 blur-3xl opacity-60" />
            <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-blue-50 blur-3xl opacity-60" />

            <div className="relative grid grid-cols-12 gap-4 items-center">
              {/* Ảnh chính lớn */}
              <div className="col-span-8 relative z-10">
                <div className="overflow-hidden rounded-[40px] border-[8px] border-white shadow-2xl rotate-[-2deg]">
                  <img
                    src="/about1.jpg"
                    alt="Travel experience"
                    className="h-[450px] w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
              </div>

              {/* Ảnh phụ nhỏ hơn */}
              <div className="col-span-4 space-y-4">
                <div className="overflow-hidden rounded-[30px] border-[6px] border-white shadow-xl translate-x-[-20px] translate-y-[20px] rotate-[4deg]">
                  <img
                    src="/about2.png"
                    alt="Destination"
                    className="h-[200px] w-full object-cover hover:scale-110 transition-transform"
                  />
                </div>
                <div className="bg-red-600 p-6 rounded-[30px] shadow-xl translate-x-[-40px] text-white space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Sparkles key={s} size={12} fill="white" />
                    ))}
                  </div>
                  <p className="text-[24px] font-black leading-none">10k+</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                    Khách hàng tin tưởng
                  </p>
                </div>
              </div>
            </div>

            {/* Badge nổi */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/50 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">
                    Đã kiểm chứng
                  </p>
                  <p className="text-[11px] text-slate-500">
                    100% Tour chất lượng cao
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
