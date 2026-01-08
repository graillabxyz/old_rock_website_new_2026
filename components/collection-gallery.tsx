"use client"

import { useEffect, useState } from "react"
import FadeInImage from "./collection-gallery-image";


export default function CollectionGallery() {
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);

    // Handle hydration mismatch
    useEffect(() => {
        fetch('https://metadata.oldrocknft.com/goliath/random') // Replace with your API endpoint
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Metadata network response was not OK');
                }

                return response.json(); // Parse JSON
            })
            .then((json) => {
                setData(json);       // Save data
                setLoading(false);   // Turn off loading
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);     // Turn off loading
            });
    }, []);

    if (!data || loading) {
        return null;
    }

    return (
        <div className="grid grid-cols-4 gap-2 w-full">
            {data.map((goliath, index) => (
                <div key={index} className="bg-gray-800 rounded-lg overflow-hidden relative aspect-square w-full">
                    <FadeInImage
                        src={goliath.image.replace('.webp', '-300.webp')}
                        alt={goliath.name}
                        index={index}
                    />
                </div>
            ))}
        </div>
    )
}
