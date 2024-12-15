import { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null); // Dernière mise à jour
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Temps écoulé depuis la dernière mise à jour
  
  const [openParc, setOpenParc] = useState<string | null>(null);
  const [closeParc, setCloseParc] = useState<string | null>(null);
  const [openedorclosetoday, setOpenedOrClosedToday] = useState<string | null>(null);

  const fetchOpeningTimes = async () => {
    try {
      const response = await axios.get('/api/proxy?openingtimes=true', {
        headers: {
          'accept': 'application/json',
          'park': 'europapark',
        },
      });
  
      const data = response.data;
      if (data && data.length > 0) {
        const today = data[0];
        if (today.opened_today) {
          setOpenParc(new Date(today.open_from).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
          setCloseParc(new Date(today.closed_from).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
          setOpenedOrClosedToday('ouvert');
        } else {
          setOpenedOrClosedToday('fermé');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires :', error);
    }
  };
  

  // Fonction pour récupérer les données
  const fetchData = async () => {
    const parkId = '51';
    // Utiliser l'API proxy de Next.js
    const url = `/api/proxy?parkId=${parkId}`;
  
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
    fetchOpeningTimes();

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
      <div className="infoUi">
        <div className="open-info">
          <span className="infoTextHoraire"><span>Ouvert de<p className="heureOC">&nbsp;{openParc}&nbsp;</p>à<p className="heureOC">&nbsp;{closeParc}</p>.</span><span>le parc sera<p className={`heureOC ${openedorclosetoday === 'ouvert' ? 'text-green ' : 'text-red'}`}>&nbsp;{openedorclosetoday}&nbsp;</p>aujourd'huit</span></span>
        </div>
        <div className="update-info">
          <p className="infoTextMaj">Mise à jour<br></br>Il y a {elapsedTime} s</p>
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