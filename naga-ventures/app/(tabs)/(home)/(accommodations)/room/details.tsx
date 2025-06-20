import Amenities from '@/components/Amenities';
import CardContainer from '@/components/CardContainer';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Room } from '@/types/Business';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DetailsProps {
  room: Room;
}

const Details = ({ room }: DetailsProps) => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <View>
      {/* Room Description */}
      <CardContainer
        elevation={2}
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <ThemedText type="cardTitle">Description</ThemedText>
        <ThemedText type="default2">
          {room.description?.replace(/^"|"$/g, '').trim() || 'No description provided.'}
        </ThemedText>
      </CardContainer>

      {/* Amenities */}
      <View style={{ marginTop: 16 }}>
        <ThemedText type="cardTitle">Amenities</ThemedText>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 16,
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          {Array.isArray(room.amenities) && room.amenities.length > 0 ? (
            room.amenities.map((item) => (
              <Amenities
                key={item}
                title={item.toUpperCase()}
                icon={getAmenityIcon(item)}
                iconSize={32}
                color={color}
                textSize={14}
              />
            ))
          ) : typeof room.amenities === 'string' && room.amenities.trim().length > 0 ? (
            <Amenities
              key={room.amenities}
              title={room.amenities.toUpperCase()}
              icon={getAmenityIcon(room.amenities)}
              iconSize={32}
              color={color}
              textSize={14}
            />
          ) : (
            <ThemedText type="default2">No amenities listed.</ThemedText>
          )}
        </View>
      </View>
    </View>
  );
};

const getAmenityIcon = (
  amenity: string
): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
  const map: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
    wifi: 'wifi',
    tv: 'television',
    television: 'television',
    cr: 'bathtub',
    ac: 'air-conditioner',
    aircon: 'air-conditioner',
    parking: 'car',
    laundry: 'washing-machine',
    bar: 'glass-wine',
  };
  return map[amenity.toLowerCase()] || 'checkbox-blank-outline';
};

export default Details;
