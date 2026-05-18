import Image from "next/image";

export default function FooterPayment() {
  return (
    <div className="bg-brand-5 py-6 border-b border-brand-4">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-center items-center gap-4">
          <span className="font-gotham text-white text-sm">We Using Safe Payment For</span>
          <div className="flex items-center gap-3">
            <Image src="/images/payment/Bkash.png" alt="Bkash" width={15} height={15} />
            <Image src="/images/payment/Nagad.png" alt="Nagad" width={15} height={15} />
            <Image src="/images/payment/Rocket.png" alt="Rocket" width={30} height={20} />
            <Image src="/images/payment/upay.png" alt="Upay" width={15} height={15} />
            <Image src="/images/payment/visa.png" alt="Visa" width={40} height={25} />
            <Image src="/images/payment/surecash.png" alt="SureCash" width={40} height={25} />
          </div>
        </div>
      </div>
    </div>
  );
}