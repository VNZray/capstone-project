import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Text from '../Text';
import { apiService } from '../../utils/api';
import type { Category, Type } from '../../types/TouristSpot';
import '../styles/AddSpotForm.css';

interface AddSpotFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSpotAdded: () => void;
}

const AddSpotForm: React.FC<AddSpotFormProps> = ({
  isVisible,
  onClose,
  onSpotAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    opening_hour: '',
    closing_hour: '',
    category_id: '',
    type_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load categories and types when component mounts
  useEffect(() => {
    const loadCategoriesAndTypes = async () => {
      try {
        const { categories: catData, types: typeData } = await apiService.getCategoriesAndTypes();
        setCategories(catData);
        setTypes(typeData);
      } catch (error) {
        console.error('Error loading categories and types:', error);
      }
    };

    if (isVisible) {
      loadCategoriesAndTypes();
    }
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.createTouristSpot({
        name: formData.name,
        description: formData.description,
        opening_hour: formData.opening_hour,
        closing_hour: formData.closing_hour,
        category_id: parseInt(formData.category_id),
        type_id: parseInt(formData.type_id),
      });

      alert('Spot added successfully!');
      setFormData({
        name: '',
        description: '',
        opening_hour: '',
        closing_hour: '',
        category_id: '',
        type_id: '',
      });
      onSpotAdded();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding spot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <Text variant="title" color="text-color">
            Add New Tourist Spot
          </Text>
          <button className="close-button" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>
              <Text variant="label" color="text-color">Name *</Text>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Text variant="label" color="text-color">Description *</Text>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">Opening Hour *</Text>
              </label>
              <input
                type="time"
                name="opening_hour"
                value={formData.opening_hour}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">Closing Hour *</Text>
              </label>
              <input
                type="time"
                name="closing_hour"
                value={formData.closing_hour}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <Text variant="label" color="text-color">Category *</Text>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <Text variant="label" color="text-color">Type *</Text>
            </label>
            <select
              name="type_id"
              value={formData.type_id}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select Type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              <Text variant="normal" color="text-color">Cancel</Text>
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <Text variant="normal" color="white">
                {loading ? 'Adding...' : 'Add Spot'}
              </Text>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpotForm;
