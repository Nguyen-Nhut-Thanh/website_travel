import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Globe2,
  Users2,
  Target,
  Heart,
  Award,
  ChevronRight,
  MapPin,
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Khách hàng hài lòng", value: "50,000+" },
    { label: "Tour chất lượng cao", value: "1,200+" },
    { label: "Đối tác toàn cầu", value: "300+" },
    { label: "Năm kinh nghiệm", value: "10+" },
  ];

  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Tin cậy tuyệt đối",
      desc: "Mọi thông tin tour, giá cả và dịch vụ đều được minh bạch hóa hoàn toàn.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Chất lượng hàng đầu",
      desc: "Chúng tôi khắt khe trong việc lựa chọn đối tác để đảm bảo trải nghiệm tốt nhất.",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Tận tâm phục vụ",
      desc: "Đội ngũ Travol luôn lắng nghe và hỗ trợ khách hàng mọi lúc, mọi nơi.",
    },
    {
      icon: <Globe2 className="h-6 w-6" />,
      title: "Đổi mới không ngừng",
      desc: "Áp dụng công nghệ để việc đặt tour trở nên đơn giản, nhanh chóng và thông minh.",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover"
            alt="About Travol Hero"
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-600 text-white text-[12px] font-black uppercase tracking-[3px] mb-6">
            Câu chuyện của Travol
          </span>
          <h1 className="text-[40px] md:text-[60px] font-black text-white leading-tight mb-6">
            Kiến tạo hành trình <br />
            <span className="text-red-500 italic">truyền cảm hứng</span>
          </h1>
          <p className="text-[18px] text-slate-200 leading-relaxed font-medium">
            Sứ mệnh của chúng tôi là giúp mỗi chuyến đi của bạn không chỉ là một
            kỳ nghỉ, mà là một câu chuyện đáng nhớ suốt đời.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-[32px] font-black text-slate-900 leading-tight">
                Hành trình từ niềm đam mê <br />
                đến nền tảng du lịch hàng đầu
              </h2>
              <p className="text-[16px] text-slate-600 leading-relaxed">
                Được thành lập từ năm 2015 bởi một nhóm những người trẻ yêu xê
                dịch, Travol bắt đầu chỉ với một mong muốn đơn giản: Làm thế nào
                để việc khám phá Việt Nam trở nên dễ dàng và an toàn hơn cho tất
                cả mọi người.
              </p>
              <p className="text-[16px] text-slate-600 leading-relaxed">
                Hôm nay, Travol tự hào là một trong những nền tảng công nghệ du
                lịch tiên phong, kết nối hàng triệu du khách với những trải
                nghiệm bản địa độc đáo nhất. Chúng tôi không ngừng mở rộng mạng
                lưới đối tác toàn cầu để mang cả thế giới đến gần bạn hơn.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4">
                {stats.map((s, i) => (
                  <div key={i} className="border-l-4 border-red-600 pl-4">
                    <p className="text-[28px] font-black text-slate-900 leading-none mb-2">
                      {s.value}
                    </p>
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[40px] overflow-hidden shadow-2xl relative z-10 border-[10px] border-white">
                <img
                  src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=1000"
                  className="w-full h-[500px] object-cover"
                  alt="Our Journey"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-red-600 rounded-3xl z-0 hidden md:block"></div>
              <div className="absolute -top-8 -right-8 w-48 h-48 border-8 border-slate-100 rounded-full z-0 hidden md:block"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-red-600 font-black uppercase text-[12px] tracking-[3px]">
              Triết lý hoạt động
            </span>
            <h2 className="text-[36px] font-black text-slate-900">
              Những giá trị định hình Travol
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-3">
                  {v.title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[50px] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/10 skew-x-[-20deg] translate-x-20"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="w-16 h-1 bg-red-600"></div>
              <h2 className="text-[36px] md:text-[48px] font-black text-white leading-tight">
                Cam kết của chúng tôi <br />
                với du khách
              </h2>
              <div className="space-y-4">
                {[
                  "Luôn cung cấp giá tốt nhất với chất lượng không đổi.",
                  "Quy trình đặt tour nhanh gọn trong 3 bước.",
                  "Bảo hiểm du lịch đầy đủ cho mọi hành trình.",
                  "Hỗ trợ thay đổi lịch trình linh hoạt theo nhu cầu.",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 text-slate-300"
                  >
                    <Award className="h-5 w-5 text-red-500 shrink-0" />
                    <span className="text-[16px]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400"
                  className="rounded-[30px] h-60 w-full object-cover"
                  alt="Team 1"
                />
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=400"
                  className="rounded-[30px] h-40 w-full object-cover"
                  alt="Team 2"
                />
              </div>
              <div className="space-y-4 pt-12">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400"
                  className="rounded-[30px] h-40 w-full object-cover"
                  alt="Team 3"
                />
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400"
                  className="rounded-[30px] h-60 w-full object-cover"
                  alt="Team 4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <h2 className="text-[32px] font-black text-slate-900 mb-8">
          Sẵn sàng để bắt đầu hành trình tiếp theo?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/tours"
            className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[14px] tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
          >
            Khám phá tour ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
