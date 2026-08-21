import { generateLinkToken, getDevices } from "../services/api";
import { useState, useEffect } from "react";

function Devices() {
  const [devices, setDevices] = useState([]);
  const [deviceToken, setDeviceToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchDevices() {
    try {
      const data = await getDevices();

      console.log(data);

      setDevices(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  async function handleGenerateToken() {
    try {
      const response = await generateLinkToken();

      console.log(response);

      setDeviceToken(response.token);
      setExpiresAt(response.expiresAt);
    } catch (err) {
      console.error(err);
    }
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);

    // Optional:
    // setDeviceToken("");
    // setExpiresAt("");
  }

  return (
    <div className="devices-page">
      <div className="devices-header">
        <div className="devices-header-content">
          <h1 className="devices-title">Connected Devices</h1>

          <p className="devices-subtitle">Manage all your connected devices.</p>
        </div>

        <button className="add-device-button" onClick={openModal}>
          + Add Device
        </button>
      </div>

      <div className="devices-list">
        {devices.length === 0 ? (
          <p className="devices-empty-state">No devices connected.</p>
        ) : (
          devices.map((device) => <p key={device.id}>{device.deviceName}</p>)
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="device-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="device-modal-header">
              <h2 className="device-modal-title">Link New Device</h2>

              <button className="modal-close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="device-modal-body">
              <p className="device-modal-description">
                Generate a temporary token and enter it in the desktop
                application.
              </p>

              <button
                className="generate-token-button"
                onClick={handleGenerateToken}
              >
                Generate Device Token
              </button>

              {deviceToken && (
                <div className="device-token-section">
                  <h3 className="device-token-title">Device Token</h3>

                  <div className="device-token-container">
                    <p className="device-token-value">{deviceToken}</p>
                  </div>

                  <p className="device-token-expiry">
                    Expires:{" "}
                    {new Date(expiresAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>

                  <button
                    className="copy-token-button"
                    onClick={() => navigator.clipboard.writeText(deviceToken)}
                  >
                    Copy Token
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devices;
