import React, { useEffect, useState } from 'react';
import type { TouristSpot } from '../../types/TouristSpot';
import { apiService } from '../../utils/api';

type Props = {
  spotId: string;
  onBack: () => void;
};

const TouristSpotDetails: React.FC<Props> = ({ spotId, onBack }) => {
  const [spot, setSpot] = useState<TouristSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTouristSpotById(spotId);
        setSpot(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load tourist spot details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpotDetails();
  }, [spotId]);

  if (loading) return <p>Loading details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!spot) return <p>No details found.</p>;

  return (
    <div style={{ padding: 20, color:'black'
    }}>
      <button onClick={onBack} style={{ marginBottom: 20, cursor: 'pointer' }}>
        ← Back
      </button>
      <p>{spot.name}</p>
      <p><strong>Description:</strong> {spot.description || 'N/A'}</p>
      <p><strong>Location:</strong> {spot.barangay}, {spot.municipality}, {spot.province}</p>
      <p><strong>Category:</strong> {spot.category}</p>
      <p><strong>Type:</strong> {spot.type}</p>
      <p><strong>Status:</strong> {spot.spot_status}</p>
      <p><strong>Contact:</strong> {spot.contact_phone || 'N/A'}</p>
      <p><strong>Email:</strong> {spot.contact_email || 'N/A'}</p>
    </div>
  );
};

export default TouristSpotDetails;
