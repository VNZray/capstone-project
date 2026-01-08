import React from 'react';
import { FlatList, View } from 'react-native';

interface GridListProps {
  data: any[];
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  numColumns?: number;
  columnWrapperStyle?: any;
  contentContainerStyle?: any;
  ListEmptyComponent?: React.ReactElement;
}

const GridList: React.FC<GridListProps> = ({
  data,
  renderItem,
  numColumns = 2,
  columnWrapperStyle,
  contentContainerStyle,
  ListEmptyComponent,
}) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => String(item?.id ?? index)}
      numColumns={numColumns}
      scrollEnabled={false}
      columnWrapperStyle={columnWrapperStyle}
      contentContainerStyle={contentContainerStyle}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

export default GridList;
