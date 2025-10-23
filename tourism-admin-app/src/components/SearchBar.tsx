import React from 'react';
import { IoSearch } from 'react-icons/io5';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  placeholder?: string;
  containerStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search...",
  containerStyle,
  inputStyle
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      try {
        onSearch();
      } catch (err) {
        console.error('Search handler threw:', err);
      }
    }
  };

  return (
    <div 
      className="search-bar-container"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        padding: '8px 12px',
        ...containerStyle
      }}
    >
      <IoSearch
        size={20}
        color="#666"
        style={{ marginRight: '8px', cursor: 'pointer' }}
  onClick={() => { try { onSearch(); } catch (err) { console.error('Search handler threw:', err); } }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          flex: 1,
          fontSize: '14px',
          backgroundColor: 'transparent',
          ...inputStyle
        }}
      />
    </div>
  );
};

export default SearchBar;
