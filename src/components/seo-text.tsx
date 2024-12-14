import React, { useEffect, useState } from "react";

interface Ride {
  id: number;
  name: string;
  is_open: boolean;
  wait_time: number;
}

interface Land {
  id: number;
  name: string;
  rides: Ride[];
}

export default function SeoText() {
  const [lands, setLands] = useState<Land[]>([]);

  useEffect(() => {
    const fetchWaitTimes = async () => {
      try {
        const response = await fetch(
          "https://queue-times.com/parks/51/queue_times.json"
        );
        const data = await response.json();
        console.log("Données API :", data); // Vérifiez ce qui est récupéré
        setLands(data.lands);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };
  
    fetchWaitTimes();
  }, []);
  

  // Définir la couleur et le contenu du cercle en fonction de l'état de l'attraction
  const getCircleStyle = (ride: Ride) => {
    if (!ride.is_open) {
      return {
        color: "bg-gray-500",
        text: "✖️", // Symbole pour "fermé"
      };
    }
    if (ride.wait_time <= 10) {
      return { color: "bg-green-500", text: ride.wait_time.toString() };
    }
    if (ride.wait_time <= 30) {
      return { color: "bg-yellow-500", text: ride.wait_time.toString() };
    }
    return { color: "bg-red-500", text: ride.wait_time.toString() };
  };

  return (
    <section className="text-center my-8 p-4 max-w-4xl mx-auto ">
      est
      {lands.map((land) => (
        <div key={land.id} className="mb-8">
          {/* Nom du land */}
          <h2 className="text-2xl font-bold mb-4">{land.name}</h2>

          {/* Attractions */}
          {land.rides.map((ride) => {
            const { color, text } = getCircleStyle(ride);

            return (
              <div
                key={ride.id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md mb-4"
              >
                {/* Cercle avec le temps ou état */}
                <div
                  className={`w-16 h-16 flex items-center justify-center text-white font-bold rounded-full ${color}`}
                >
                  {text}
                </div>

                {/* Nom de l'attraction */}
                <div className="text-left ml-4 text-lg font-medium">
                  {ride.name}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
