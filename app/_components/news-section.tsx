const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

export default function NewsSection() {
  return (
    <section className="relative overflow-hidden z-30 bg-white">
      {/* Fixed Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ 
          backgroundImage: `url('${newsImage}')`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Solid White Overlay */}
      <div className="absolute inset-0 bg-white -z-5"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 pt-14 sm:px-8 lg:pb-36 lg:pt-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]">NEWS</p>
        <h2 className="mt-4 font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
          Cosa accade nel mondo di Humana Vintage
        </h2>
      </div>
    </section>
  );
}
