export default function WhyChooseSection() {
  const items = [
    {
      title: "An Toàn Tuyệt Đối",
      description:
        "Chúng tôi cam kết tiêu chuẩn an toàn cao nhất, đảm bảo mọi hành trình của bạn luôn được bảo vệ và hỗ trợ kịp thời.",
      icon: "https://cdn-icons-png.flaticon.com/512/784/784306.png",
      rotate: "-rotate-[15deg]",
    },
    {
      title: "Dịch Vụ Đẳng Cấp",
      description:
        "Tận hưởng những dịch vụ cao cấp được thiết kế riêng biệt, mang lại sự thoải mái và hài lòng tối đa cho du khách.",
      icon: "https://cdn-icons-png.flaticon.com/512/1042/1042339.png",
      rotate: "rotate-[10deg]",
    },
    {
      title: "Tiết Kiệm Chi Phí",
      description:
        "Cung cấp mức giá cạnh tranh nhất cùng nhiều ưu đãi hấp dẫn giúp bạn có chuyến đi trong mơ với chi phí hợp lý.",
      icon: "https://cdn-icons-png.flaticon.com/512/2721/2721091.png",
      rotate: "",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-10 xl:px-20">
      <div className="mb-16 px-6">
        <div className="relative inline-block">
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#1a2b48]">
            TẠI SAO NÊN CHỌN TRAVOL
          </h2>
          <span className="absolute -bottom-1 left-0 h-[4px] w-12 bg-sky-500" />
        </div>
      </div>

      <div className="container relative mx-auto">
        <div className="absolute left-0 top-1/4 hidden w-full -z-0 lg:block">
          <svg width="100%" height="150" viewBox="0 0 1200 150" fill="none">
            <path
              d="M0 80C200 150 400 20 600 80C800 140 1000 10 1200 80"
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <div className="relative flex h-24 w-24 items-center justify-center">
                <img
                  src={item.icon}
                  alt={item.title}
                  className={`h-16 w-16 object-contain ${item.rotate} transition-transform hover:scale-110`}
                />
              </div>

              <h3 className="text-xl font-bold text-[#1a2b48]">{item.title}</h3>

              <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
