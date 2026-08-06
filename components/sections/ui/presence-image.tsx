import Image from 'next/image';

export default function PresenceImage() {
  return (
    <div className="container mx-auto">
      <div className="relative w-full h-40 mb-2">
        <Image 
          src="/images/presence-1.svg" 
          alt="Global Presence" 
          fill  
          className="object-contain"
        />
      </div>
    </div>
  );
}