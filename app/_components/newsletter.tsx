const newsletterBgImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

export default function Newsletter() {
  return (
    <section className="Newsletter-wrapper relative px-4 py-16 sm:px-8 overflow-hidden z-30 bg-[#ffd02f]">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ 
          backgroundImage: `url('${newsletterBgImage}')`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Solid Yellow Overlay */}
      <div className="absolute inset-0 bg-[#ffd02f] -z-5"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <div>
          <h2 className="font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
            Iscriviti alla nostra Newsletter
          </h2>
          <p className="mt-4 text-sm font-medium text-black sm:text-base">
            Resta sempre aggiornato e ricevi subito il 10% di sconto
          </p>
        </div>
        <div>
          <form className="flex w-full">
            <input
              type="email"
              placeholder="Inserisci la tua email"
              className="min-w-0 flex-1 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
            />
            <button
              type="submit"
              className="bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-neutral-800 transition-colors"
            >
              ISCRIVITI
            </button>
          </form>

          <label className="mt-5 flex items-center gap-3 text-sm font-bold text-black">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-neutral-400 bg-white"
            />
            <span>Ho letto e accetto i termini e le condizioni</span>
          </label>
        </div>
      </div>
    </section>
  );
}
