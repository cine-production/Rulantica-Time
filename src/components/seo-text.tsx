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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Nouveaux états pour les horaires d'ouverture et de fermeture
  const [openParc, setOpenParc] = useState<string>('');
  const [closeParc, setCloseParc] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [today, setToday] = useState<string>('');

  // Fonction pour récupérer les horaires d'ouverture
  const fetchOpeningTimes = () => {
    fetch('https://api.waitingtimes.app/v1/openingtimes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.generalSchedule) {
          const todaySchedule = data.generalSchedule.find((schedule: any) => {
            const todayDate = new Date().toISOString().split('T')[0];
            return schedule.date === todayDate;
          });

          if (todaySchedule) {
            setOpenParc(todaySchedule.openingTime);
            setCloseParc(todaySchedule.closingTime);
            setIsOpen(todaySchedule.isOpen);
          }

          setToday(new Date().toLocaleDateString());
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des horaires :', error);
      });
  };

  // Fonction pour récupérer les données des attractions
  const fetchQueueTimes = () => {
    const parkId = '51';
    fetch(`https://cors-anywhere.herokuapp.com/https://queue-times.com/parks/${parkId}/queue_times.json`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.lands) {
          setLands(data.lands);
          setLastUpdate(new Date());
          setElapsedTime(0);
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des données :', error);
      });
  };

  useEffect(() => {
    fetchOpeningTimes(); // Récupération initiale des horaires
    fetchQueueTimes(); // Récupération initiale des données des attractions

    // Mise à jour toutes les 60 secondes
    const interval = setInterval(() => {
      fetchQueueTimes();
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
        <div className="open-info">
          <p className="infoTextHoraire">
            Horaires : <span className="heureOC">{openParc}</span> à <span className="heureOC">{closeParc}</span>
          </p>
          <p className="infoTextStatus">
            Statut : {isOpen ? 'Ouvert' : 'Fermé'}
          </p>
          <p className="infoTextDate">Date : {today}</p>
        </div>
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
