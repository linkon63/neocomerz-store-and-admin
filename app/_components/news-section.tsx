const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

const newsData = [] as any;

export default function NewsSection() {


  return (
    <section className="relative overflow-hidden z-30 bg-white my-16 md:my-24 lg:my-32">
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
      <div className="relative z-10 mx-auto pb-28 pt-14 container lg:pb-36 lg:pt-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]">News</p>
        <h2 className="mt-4 font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
          What's happening in the world of Humana Vintage
        </h2>

        {/* Empty State Logic */}
        {newsData.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm">
            <p className="text-gray-500 font-medium italic">
              Currently, there are no news updates available.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later for fresh updates from the archive!
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">

          </div>
        )}
      </div>
    </section>
  );
}