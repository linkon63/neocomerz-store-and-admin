"use client"

export default function ContactInfoCard() {

    return (
        <div>
            <div className="space-y-12">
                <div>
                    <h2 className="text-2xl font-bold mb-6">Humana People to People Italy</h2>
                    <div className="space-y-6 text-gray-700">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📍</span>
                            <div>
                                <p className="font-bold">Address</p>
                                <p>Via Bergamo 9 B/C, 20006 Pregnana Milanese (MI)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📞</span>
                            <div>
                                <p className="font-bold">Tel</p>
                                <p>(+39) 02 93964052</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">✉️</span>
                            <div>
                                <p className="font-bold">Email</p>
                                <p>vintageonline@humanaitalia.org</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}