import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const handleSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition({ latitude, longitude });
      setLoading(false);
      setError(null);
    };

    const handleError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    const id = navigator.geolocation.getCurrentPosition(
      handleSuccess, 
      handleError, 
      options
    );

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { loading, error, position };
};
