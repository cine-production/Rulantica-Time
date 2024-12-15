import { useEffect, useState } from 'react';
import axios from 'axios';

interface Attraction {
  id: number;
  name: string;
  wait_time: number;
  is_open: boolean;
}

interface Land {
  id: number;
  name: string;
  rides: Attraction[];
}

export default function SeoText() {
  const [lands, setLands] = useState<Land[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Fonction pour récupérer les données via votre propre API
  const fetchData = async () => {
    const parkId = '51'; // L'identifiant du parc à utiliser
    const url = `/api/queue-times?parkId=${parkId}`; // Utilisation de l'API Next.js comme proxy

    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (response.data && response.data.lands) {
        setLands(response.data.lands);
        setLastUpdate(new Date());
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  useEffect(() => {
    fetchData(); // Récupération initiale des données

    // Mise à jour toutes les 60 secondes
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    // Mise à jour du temps écoulé chaque seconde
    const elapsedInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Nettoyage des intervalles
    return () => {
      clearInterval(interval);
      clearInterval(elapsedInterval);
    };
  }, []);

  const getColor = (waitTime: number, isOpen: boolean) => {
    if (!isOpen) return 'gray';
    if (waitTime < 35) return 'green';
    if (waitTime < 65) return 'yellow';
    return 'red';
  };

  return (
    <section className="seo-text-container">
      <div className="infoUi">
        <div className="update-info">
          <p className="infoTextMaj">Mise à jour<br />Il y a {elapsedTime} s</p>
        </div>
      </div>

      {lands && lands.length > 0 ? (
        lands.map((land) => (
          <div key={land.id} className="land-section">
            <h2 className="land-name">{land.name}</h2>
            {land.rides.length > 0 ? (
              land.rides.map((ride) => (
                <div
                  key={ride.id}
                  className={`ride-item ${getColor(ride.wait_time, ride.is_open)}`}
                >
                  <div className={`wait-time-circle ${getColor(ride.wait_time, ride.is_open)}`}>
                    {ride.is_open ? ride.wait_time : <img width="35rem" src="/fermer.svg" />}
                  </div>
                  <span className="ride-name">{ride.name}</span>
                </div>
              ))
            ) : (
              <p>Aucune attraction disponible dans ce land.</p>
            )}
          </div>
        ))
      ) : (
        <p>Chargement des données...</p>
      )}
    </section>
  );
}
