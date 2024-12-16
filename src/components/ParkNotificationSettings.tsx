import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#__next"); // Adapté à Next.js

export default function ParkNotificationSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(10); // Temps par défaut : 10 minutes

  // Charger l'état initial depuis le localStorage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("parkNotificationSettings") || "{}");
    setIsNotificationEnabled(savedSettings.enabled || false);
    setNotificationTime(savedSettings.time || 10);
  }, []);

  // Sauvegarder les paramètres à chaque changement
  useEffect(() => {
    localStorage.setItem(
      "parkNotificationSettings",
      JSON.stringify({ enabled: isNotificationEnabled, time: notificationTime })
    );
  }, [isNotificationEnabled, notificationTime]);

  const handleSaveSettings = async () => {
    if (isNotificationEnabled) {
      await axios.post("/src/pages/api/openedpark", { time: notificationTime });
    }
    setIsOpen(false); // Fermer la fenêtre
  };

  return (
    <>
      <button className="settings-button" onClick={() => setIsOpen(true)}>
        ⚙️ Paramètres
      </button>
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Paramètres de notification"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Paramètres de notification</h2>
        <div className="modal-content">
          <label>
            <input
              type="checkbox"
              checked={isNotificationEnabled}
              onChange={(e) => setIsNotificationEnabled(e.target.checked)}
            />
            Activer les notifications
          </label>
          {isNotificationEnabled && (
            <>
              <label>
                Recevoir une notification :
                <select
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(Number(e.target.value))}
                >
                  <option value={5}>5 minutes avant</option>
                  <option value={10}>10 minutes avant</option>
                  <option value={15}>15 minutes avant</option>
                  <option value={20}>20 minutes avant</option>
                </select>
              </label>
            </>
          )}
          <button className="save-button" onClick={handleSaveSettings}>
            Sauvegarder
          </button>
        </div>
      </Modal>
    </>
  );
}
