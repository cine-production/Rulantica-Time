import { useState } from 'react';

const AttractionMenu = ({ ride, onClose }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [thresholdMinutes, setThresholdMinutes] = useState(5); // Minutes par défaut

  const handleSwitchToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const incrementMinutes = () => {
    setThresholdMinutes((prev) => prev + 1);
  };

  const decrementMinutes = () => {
    if (thresholdMinutes > 0) {
      setThresholdMinutes((prev) => prev - 1);
    }
  };

  return (
    <div className="notification-menu">
      <h3>Gérer les notifications</h3>
      <p>Attraction : {ride.name}</p>
      <div className="menu-item">
        <label>
          Activer les notifications :
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleSwitchToggle}
          />
        </label>
      </div>
      <div className="menu-item">
        <label>Seuil en minutes :</label>
        <div className="time-controls">
          <button onClick={decrementMinutes}>-</button>
          <span>{thresholdMinutes} min</span>
          <button onClick={incrementMinutes}>+</button>
        </div>
      </div>
      <button className="close-button" onClick={onClose}>
        Fermer
      </button>
    </div>
  );
};
