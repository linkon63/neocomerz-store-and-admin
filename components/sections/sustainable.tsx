export default function Sustainable() {
  return (
    <section 
      className="relative w-full h-[500px] overflow-hidden rounded-[40px] bg-cover bg-center mx-4 my-8 md:mx-8 lg:mx-12"
      style={{ backgroundImage: "url('/images/footer/footerbanner.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 rounded-[40px]"></div>
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <h2 className="font-['Gotham'] text-2xl font-medium uppercase tracking-wider md:text-3xl">
          Sustainable
        </h2>
        <h3 className="mt-2 font-['Snell_Roundhand_LT_Std'] text-4xl italic md:text-5xl lg:text-6xl">
          and ethical sourcing
        </h3>
        
        <p className="mx-auto mt-6 max-w-3xl font-['Gotham'] text-sm leading-relaxed md:text-base lg:text-lg">
          London T.E Exchange Has made it's mission to select/sourcing a sustainable and ethical sourcing supply chain. We want 
          warm and cozy scene for tea interesars.... a serene social gatherings place, where farm tea have developed and led the 
          2021 Fair launch period. London T.E contribute in the Rainforest Network and Soil for impact initiatives around 
          reforestation and campaigns.
        </p>
      </div>
    </section>
  );
}
