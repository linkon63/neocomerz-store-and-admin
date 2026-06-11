export default function OurStory() {
  return (
    <section className="relative w-full py-20 md:py-32">
      <div className="our-story-wrapper"> 
        <div className="container mx-auto px-6 md:px-12" style={{ fontFamily: 'var(--font-bembo)' }}>
            {/* Main heading */}
            <h3 className="text-3xl md:text-4xl mb-12 leading-relaxed">
              We believe refinement is not created—it is preserved.
            </h3>
            
            {/* First paragraph */}
            <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-800">
              In the quiet gardens of Sylhet, nature already sets the standard. Our role is not to improve it, but to respect it with discipline and intention. Inspired by the heritage philosophy of the London Tea Exchange, we follow a simple belief:
            </p>
            
            {/* Highlighted text */}
            <p className="text-lg md:text-xl mb-12 leading-relaxed text-gray-800">
              what is rare should never be rushed, and what is pure should never be compromised.
            </p>
            
            {/* Second paragraph */}
            <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-800">
              This is not just how we source tea—
            </p>
            <p className="text-lg md:text-xl mb-12 leading-relaxed text-gray-800">
              this is how we define everything we do.
            </p>
            
            {/* Button */}
            <button className="px-8 py-3 rounded-full border-2 border-black text-black font-medium uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-colors duration-300">
              Explore Our Story
            </button>
            
        </div>
      </div>
    </section>
  );
}
