import PageContainer from '@/components/PageContainer';
import PhotoGallery from '@/components/PhotoGallery';
import React from 'react';

// Sample room photos - replace with actual data from props or API
const SAMPLE_ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
];

const RoomPhotos = () => {
  return (
    <PageContainer style={{ paddingTop: 0 }}>
      <PhotoGallery 
        photos={SAMPLE_ROOM_PHOTOS}
        title="Room Photos"
        columns={2}
      />
    </PageContainer>
  );
};

export default RoomPhotos;