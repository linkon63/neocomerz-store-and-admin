import Image from "next/image";

export default function Subtract() {
  return (
    <section className="relative bg-[#F9F9FB] overflow-hidden">
      <div className="relative min-h-175 w-full">
        <Image
          src="/images/subtract.jpeg"
          alt="Tea Garden"
          fill
          className="object-cover"
          priority
        />
        <svg
          className="absolute top-0 left-0 w-full h-45"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C360,180 1080,180 1440,0 L1440,0 L0,0 Z"
            fill="#bdbdb5"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-45"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C360,180 1080,180 1440,0 L1440,180 L0,180 Z"
            fill="#F9F9FB"
          />
        </svg>
      </div>
    </section>
  );
}
