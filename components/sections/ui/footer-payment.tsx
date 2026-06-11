import Image from "next/image";

export default function FooterPayment() {
  return (
    <div className="text-center md:text-left">
      <span className="font-['Gotham'] text-white text-sm font-medium block mb-2">We Using Safe Payment For</span>
      <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
        <Image src="/images/payment/Bkash.svg" alt="Bkash" width={30} height={20} className="object-contain" />
        <Image src="/images/payment/Nagad.svg" alt="Nagad" width={30} height={20} className="object-contain" />
        <Image src="/images/payment/Rocket.svg" alt="Rocket" width={35} height={22} className="object-contain" />
        <Image src="/images/payment/upay.svg" alt="Upay" width={30} height={20} className="object-contain" />
        <Image src="/images/payment/visa.svg" alt="Visa" width={45} height={28} className="object-contain" />
        <Image src="/images/payment/surecash.svg" alt="SureCash" width={45} height={28} className="object-contain" />
      </div>
    </div>
  );
}