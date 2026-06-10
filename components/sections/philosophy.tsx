export default function Philosophy() {
  return (
    <section className="relative w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/ph.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30 z-1"></div>
      <div className="philosophy-wrapper h-full min-h-220 relative z-10 flex items-end"> 
        <div className="container mx-auto py-12 pb-16">
            <div className="philosophy-content">
                <p className="text-white text-sm uppercase mb-4">Product Philosophy</p>
                <h2 className="text-white text-5xl md:text-6xl lg:text-8xl font-['Snell_Roundhand_LT_Std'] italic leading-tight">
                  From Origin to Elegance—Where
                  Intention Meets Restraint
                </h2>
            </div>
        </div>
      </div>
    </section>
  );
}