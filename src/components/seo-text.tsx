import { useEffect, useState } from 'react';
import axios from 'axios';
import subscriptionManager from "@/services/subscriptionManager"
import { clientSettings } from "@magicbell/react-headless";


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

  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(false); // État du switch (activé ou désactivé)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false); // État pour savoir si la fenêtre des paramètres est ouverte
  const [notificationTimeBefore, setNotificationTimeBefore] = useState<number>(5); // Temps avant l'ouverture du parc pour la notification (en minutes)
  const [expandedRide, setExpandedRide] = useState<{ [key: number]: number }>({}); // Gérer l'état des temps pour chaque attraction

  // Nouveau state pour afficher ou cacher le panneau de paramètres
  const [rideFeatureStates, setRideFeatureStates] = useState<{ [key: number]: boolean }>({});


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
          // setOpenParc(new Date(today.open_from).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
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
    sendNotification();

    const savedRides = Object.keys(localStorage)
      .filter((key) => key.startsWith('ride-') && key.endsWith('-time'))
      .reduce((acc, key) => {
        const rideId = parseInt(key.replace('ride-', '').replace('-time', ''), 10);
        acc[rideId] = parseInt(localStorage.getItem(key) || '0', 10);
        return acc;
      }, {} as { [key: number]: number });

    setExpandedRide(savedRides);

    // Vérifier si la fonctionnalité était activée avant
    const savedFeatureState = localStorage.getItem('isFeatureEnabled');
    if (savedFeatureState) {
      setIsFeatureEnabled(JSON.parse(savedFeatureState));
    }

    const savedSwitchStates = Object.keys(localStorage)
      .filter((key) => key.startsWith('ride-') && key.endsWith('-enabled'))
      .reduce((acc, key) => {
        const rideId = parseInt(key.replace('ride-', '').replace('-enabled', ''), 10);
        acc[rideId] = JSON.parse(localStorage.getItem(key) || 'false');
        return acc;
      }, {} as { [key: number]: boolean });

    setRideFeatureStates(savedSwitchStates);
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const rideElements = document.querySelectorAll('.ride-item');
      let clickedInside = false;

      rideElements.forEach((element) => {
        if (element.contains(event.target as Node)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setExpandedRide({});
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Gérer le changement d'état du switch
  const handleRideClick = (rideId: number) => {
    setExpandedRide((prev) => ({
      ...prev,
      [rideId]: prev[rideId] || 0, // Initialiser à 0 si non existant
    }));
  };

  const handleTimeChange = (rideId: number, change: number) => {
    setExpandedRide((prev) => {
      const updatedTime = (prev[rideId] || 0) + change;
      const time = Math.max(0, updatedTime); // Empêcher un temps négatif
      localStorage.setItem(`ride-${rideId}-time`, time.toString());
      return { ...prev, [rideId]: time };
    });
  };




  // Fonction pour envoyer la notification via MagicBell
  const sendNotification = async () => {
    if (isFeatureEnabled && openParc) {
      const openTime = new Date();
      const openParc = "17:39";
      const [hours, minutes] = openParc.split(':').map((str) => parseInt(str, 10));
      openTime.setHours(hours);
      openTime.setMinutes(minutes - notificationTimeBefore); // Calcul de l'heure d'envoi de la notification

      const currentTime = new Date();
      const delay = openTime.getTime() - currentTime.getTime(); // Calcul du délai en millisecondes

      if (delay > 0) {
        console.log(`Notification sera envoyée dans ${delay / 1000} secondes`);

        // Utiliser setTimeout pour envoyer la notification après le délai calculé
        setTimeout(async () => {
          // Utilisation de MagicBell pour envoyer la notification
          const userId = clientSettings.getState().userExternalId;
          if (userId) {
            try {
              const response = await fetch('/api/hn_top_story', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                body: JSON.stringify({
                  userId,
                  openParc // Envoyer openParc au backend
                }),
              });

              if (response.ok) {
                console.log('Notification envoyée avec succès');
              } else {
                throw new Error('Erreur lors de l\'envoi de la notification');
              }
            } catch (error) {
              console.error('Erreur lors de l\'envoi de la notification :', error);
            }
          }
        }, delay); // La notification sera envoyée après le délai calculé
      } else {
        console.log("L'heure d'envoi de la notification est déjà passée");
      }
    }
  };



  // Fonction pour déterminer la couleur en fonction du temps d'attente
  const getColor = (waitTime: number, isOpen: boolean) => {
    if (!isOpen) return 'gray'; // Gris si l'attraction est fermée
    if (waitTime < 35) return 'green';  // Vert
    if (waitTime < 65) return 'yellow'; // Jaune
    return 'red';  // Rouge
  };

  const cleanFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9]/g, ""); // Supprime tous les caractères non alphanumériques
  };



  return (
    <section className="seo-text-container">
      <div className="infoUi">
        <div className="open-info">
          <span className="infoTextHoraire">
            <span>Ouvert de<p className="heureOC">&nbsp;{openParc}&nbsp;</p>à<p className="heureOC">&nbsp;{closeParc}</p>.</span>
            <span>le parc sera<p className={`POC ${openedorclosetoday === 'ouvert' ? 'text-green ' : 'text-red'}`}>&nbsp;{openedorclosetoday}&nbsp;</p>aujourd'huit</span>
          </span>
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
                  className={`ride-item ${getColor(ride.wait_time, ride.is_open)} ${expandedRide[ride.id] !== undefined ? 'expanded' : ''
                    }`}
                //onClick={() => handleRideClick(ride.id)} // Gestion du clic
                >
                  <div className="ride-one">
                    <div className={`wait-time-circle ${getColor(ride.wait_time, ride.is_open)} ${expandedRide[ride.id] !== undefined ? 'transformed' : ''}`}>
                      {ride.is_open ? ride.wait_time : <img width="35rem" src="/fermer.svg" />} {/* Affichage du temps ou du symbole interdit */}
                    </div>
                    <div className='contentRide'>
                      <span className="ride-name">{ride.name}</span>
                      <img src={`/${cleanFileName(ride.name)}.png`} alt="" />
                    </div>
                  </div>
                  {expandedRide[ride.id] !== undefined && (
                    <div className="ride-deve">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isFeatureEnabled} // État du switch
                          onChange={(e) => {
                            e.stopPropagation();
                            const newState = e.target.checked;
                            setIsFeatureEnabled(newState);
                            localStorage.setItem(`ride-${ride.id}-enabled`, JSON.stringify(newState));
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                      <button onClick={(e) => { e.stopPropagation(); handleTimeChange(ride.id, -5); }}>-</button>
                      <span>{expandedRide[ride.id]} min</span>
                      <button onClick={(e) => { e.stopPropagation(); handleTimeChange(ride.id, 5); }}>+</button>
                    </div>
                  )}

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
