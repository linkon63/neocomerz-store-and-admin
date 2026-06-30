export default function FooterNewsletter() {
  return (
    <div className="flex items-center w-full  mx-auto bg-white p-2">
      <input
        type="email"
        placeholder="Join Our Newsletter Now"
        className="flex-1 bg-white px-3 md:px-6 py-2 md:py-3 font-['Gotham'] text-sm text-rich-black  placeholder:text-rich-black outline-none border-r-brand-5 border-r transition-colors"
      />
      <button className="bg-white text-rich-black px-4 md:px-8 py-2 md:py-3 font-['Gotham'] text-sm md:text-base font-medium uppercase transition-colors whitespace-nowrap cursor-pointer">
        SUBSCRIBE
      </button>
    </div>
  );
}
