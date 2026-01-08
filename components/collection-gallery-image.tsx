"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function FadeInImage({ src, alt, index }: { src: string; alt: string; index: number }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <Image
            src={src}
            alt={alt}
            className={`object-cover transition-opacity duration-700 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority={index < 4} // Load the first row with priority
            onLoadingComplete={() => setLoaded(true)}
        />
    );
}
