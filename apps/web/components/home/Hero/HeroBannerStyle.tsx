export default function HeroBannerStyle() {
  return (
    <style jsx global>{`
      .hero-section {
        position: relative;
        width: 100%;
        min-height: 700px;
        overflow: hidden;
        background: #111;
      }

      .slide {
        position: absolute;
        inset: 0;
      }

      .slide .hero-banner-item {
        position: absolute;
        width: 180px;
        height: 270px;
        top: calc(100% - 390px);
        background-size: cover;
        background-position: center;
        transition: all 0.8s cubic-bezier(0.75, 0, 0.25, 1);
        z-index: 10;
      }

      .slide .hero-banner-item::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.05) 0%,
          rgba(0, 0, 0, 0.65) 100%
        );
        transition: 0.7s ease;
        z-index: 1;
      }

      .slide .hero-banner-item:nth-child(1),
      .slide .hero-banner-item:nth-child(2) {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0 !important;
        box-shadow: none !important;
        z-index: 1;
        cursor: default;
      }

      .slide .hero-banner-item:nth-child(1)::before,
      .slide .hero-banner-item:nth-child(2)::before {
        background:
          linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.2) 55%,
            rgba(0, 0, 0, 0.1) 100%
          ),
          linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.2) 0%,
            transparent 30%,
            rgba(0, 0, 0, 0.3) 100%
          );
      }

      .slide .hero-banner-item:nth-child(3) {
        left: calc(50% + 50px);
      }

      .slide .hero-banner-item:nth-child(4) {
        left: calc(50% + 248px);
      }

      .slide .hero-banner-item:nth-child(5) {
        left: calc(50% + 446px);
      }

      .slide .hero-banner-item:nth-child(n + 6) {
        left: calc(50% + 644px);
        opacity: 0;
      }

      .slide .hero-banner-item:nth-child(1) .thumb-content,
      .slide .hero-banner-item:nth-child(2) .thumb-content {
        opacity: 0;
        pointer-events: none;
      }

      .animate-hero-content .hero-meta,
      .animate-hero-content .hero-title,
      .animate-hero-content .hero-desc,
      .animate-hero-content .hero-action {
        animation: fadeInText 0.8s ease-out forwards;
        opacity: 0;
      }

      .animate-hero-content .hero-title {
        animation-delay: 0.15s;
      }

      .animate-hero-content .hero-desc {
        animation-delay: 0.3s;
      }

      .animate-hero-content .hero-action {
        animation-delay: 0.45s;
      }

      @keyframes fadeInText {
        from {
          opacity: 0;
          transform: translateY(40px);
          filter: blur(5px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }

      @media (max-width: 991px) {
        .slide .hero-banner-item:nth-child(3) {
          left: 24px;
        }

        .slide .hero-banner-item:nth-child(4) {
          left: 222px;
        }

        .slide .hero-banner-item:nth-child(5) {
          left: 420px;
        }

        .slide .hero-banner-item:nth-child(n + 6) {
          left: 618px;
        }
      }

      @media (max-width: 640px) {
        .slide .hero-banner-item {
          width: 130px;
          height: 190px;
          top: calc(100% - 310px);
        }

        .slide .hero-banner-item:nth-child(3) {
          left: 16px;
        }

        .slide .hero-banner-item:nth-child(4) {
          left: 162px;
        }

        .slide .hero-banner-item:nth-child(5) {
          left: 308px;
        }
      }
    `}</style>
  );
}
