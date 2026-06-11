
export default function FooterNewsletter() {
  return (
    <div className="flex items-center w-full max-w-md mx-auto bg-white p-4">
      <input
        type="email"
        placeholder="Join Our Newsletter Now"
        className="flex-1 bg-white px-4 py-2 font-['Gotham'] text-sm text-gray-800 placeholder:text-gray-500 outline-none border-r-brand-5 border-r transition-colors"
      />
      <button className="bg-white text-gray-800 px-6 py-2 font-['Gotham'] text-sm font-medium uppercase transition-colors whitespace-nowrap cursor-pointer">
        SUBSCRIBE
      </button>
    </div>
  );
}
