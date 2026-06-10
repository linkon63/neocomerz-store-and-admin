const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

export default function JournalParallax() {
  return (
    <section className="Journalparalux-wrapper"> 
      <div className="relative h-[460px] sm:h-[560px] overflow-hidden">
        {/* Parallax Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${newsImage}')`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Content Container */}
        <div className="relative h-full w-full max-w-360 mx-auto flex flex-col justify-end pb-12 sm:pb-16 z-10">
          <div className="px-6 sm:px-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">Journal</p>
            <h2 className="mt-3 max-w-3xl font-bembo text-3xl font-bold leading-none text-white sm:text-5xl">
              Small gestures that transform the world
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
