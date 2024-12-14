import { useEffect, useState } from 'react';

// Définition des types
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null); // État pour suivre la dernière mise à jour
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Temps écoulé depuis la dernière mise à jour

  // Fonction pour récupérer les données
  const fetchData = () => {
    const parkId = '51'; // Remplacez par l'ID réel du parc
    fetch(`/api/proxy?parkId=${parkId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Données récupérées:', data); // Afficher les données dans la console
  
        if (data && data.lands) {
          setLands(data.lands);
          setLastUpdate(new Date()); // Met à jour l'heure actuelle comme dernière mise à jour
          setElapsedTime(0); // Réinitialise le compteur à 0
        } else {
          console.error('Données invalides:', data); // Afficher une erreur si la structure est incorrecte
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des données :', error);
      });
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

  // Fonction pour déterminer la couleur en fonction du temps d'attente
  const getColor = (waitTime: number, isOpen: boolean) => {
    if (!isOpen) return 'gray'; // Gris si l'attraction est fermée
    if (waitTime < 35) return 'green';  // Vert
    if (waitTime < 65) return 'yellow'; // Jaune
    return 'red';  // Rouge
  };

  return (
    <section className="seo-text-container">
      <div className="update-info">
        <p>Temps écoulé depuis la dernière mise à jour : {elapsedTime} secondes</p>
      </div>

      {lands && lands.length > 0 ? (
        lands.map((land) => (
          <div key={land.id} className="land-section">
            <h2 className="land-name">{land.name}</h2>
            {land.rides.length > 0 ? (
              land.rides.map((ride) => (
                <div
                  key={ride.id}
                  className={`ride-item ${getColor(ride.wait_time, ride.is_open)}`} // Application dynamique de la couleur
                >
                  <div className={`wait-time-circle ${getColor(ride.wait_time, ride.is_open)}`}>
                    {ride.is_open ? ride.wait_time : <img width="35rem" src="/fermer.svg" />} {/* Affichage du temps ou du symbole interdit */}
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
