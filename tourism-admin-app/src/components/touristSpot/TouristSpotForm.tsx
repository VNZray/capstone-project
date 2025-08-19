import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Text from "../Text";
import { apiService } from "../../utils/api";
import type {
  Category,
  Province,
  Municipality,
  Barangay,
  TouristSpot,
} from "../../types/TouristSpot";
import "../styles/TouristSpotForm.css";

interface TouristSpotFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSpotAdded?: () => void;
  onSpotUpdated?: () => void;
  mode: 'add' | 'edit';
  initialData?: TouristSpot;
}

const TouristSpotForm: React.FC<TouristSpotFormProps> = ({
  isVisible,
  onClose,
  onSpotAdded,
  onSpotUpdated,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    province_id: "",
    municipality_id: "",
    barangay_id: "",
    latitude: "",
    longitude: "",
    contact_phone: "",
    contact_email: "",
    website: "",
    entry_fee: "",
    category_id: "3",
    type_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        province_id: initialData.province_id.toString(),
        municipality_id: initialData.municipality_id.toString(),
        barangay_id: initialData.barangay_id.toString(),
        latitude: initialData.latitude?.toString() || "",
        longitude: initialData.longitude?.toString() || "",
        contact_phone: initialData.contact_phone,
        contact_email: initialData.contact_email || "",
        website: initialData.website || "",
        entry_fee: initialData.entry_fee?.toString() || "",
        category_id: initialData.category_id.toString(),
        type_id: initialData.type_id.toString(),
      });
    } else if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        name: "",
        description: "",
        province_id: "",
        municipality_id: "",
        barangay_id: "",
        latitude: "",
        longitude: "",
        contact_phone: "",
        contact_email: "",
        website: "",
        entry_fee: "",
        category_id: "3",
        type_id: "",
      });
    }
  }, [mode, initialData, isVisible]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesTypes, locationData] = await Promise.all([
          apiService.getCategoriesAndTypes(),
          apiService.getLocationData(),
        ]);

        setCategories(categoriesTypes.categories);
        setProvinces(locationData.provinces);
        setMunicipalities(locationData.municipalities);
        setBarangays(locationData.barangays);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const spotData = {
        name: formData.name,
        description: formData.description,
        province_id: parseInt(formData.province_id),
        municipality_id: parseInt(formData.municipality_id),
        barangay_id: parseInt(formData.barangay_id),
        latitude: parseFloat(formData.latitude) || undefined,
        longitude: parseFloat(formData.longitude) || undefined,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || undefined,
        website: formData.website || undefined,
        entry_fee: formData.entry_fee
          ? parseFloat(formData.entry_fee)
          : undefined,
        category_id: parseInt(formData.category_id),
        type_id: 4,
      };

      if (mode === 'add') {
        await apiService.createTouristSpot(spotData);
        alert("Spot added successfully!");
        if (onSpotAdded) onSpotAdded();
      } else {
        if (!initialData?.id) {
          throw new Error("No ID provided for update");
        }
        await apiService.submitEditRequest(initialData.id, spotData);
        alert("Edit request submitted successfully! It is now pending admin approval.");
        if (onSpotUpdated) onSpotUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(`Error ${mode === 'add' ? 'adding' : 'updating'} spot. Please try again.`);
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
            {mode === 'add' ? 'Add New Tourist Spot' : 'Edit Tourist Spot'}
          </Text>
          <button className="close-button" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>
              <Text variant="label" color="text-color">
                Name *
              </Text>
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
              <Text variant="label" color="text-color">
                Description *
              </Text>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-textarea"
              rows={1}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">
                  Address *
                </Text>
              </label>
              <select
                name="province_id"
                value={formData.province_id}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.province}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Text variant="label" color="white">
                  Municipality *
                </Text>
              </label>
              <select
                name="municipality_id"
                value={formData.municipality_id}
                onChange={handleInputChange}
                required
                className="form-select"
                disabled={!formData.province_id}
              >
                <option value="">Select Municipality</option>
                {municipalities
                  .filter(
                    (m) =>
                      !formData.province_id ||
                      m.province_id === parseInt(formData.province_id)
                  )
                  .map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.municipality}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Text variant="label" color="white">
                  Barangay *
                </Text>
              </label>
              <select
                name="barangay_id"
                value={formData.barangay_id}
                onChange={handleInputChange}
                required
                className="form-select"
                disabled={!formData.municipality_id}
              >
                <option value="">Select Barangay</option>
                {barangays
                  .filter(
                    (b) =>
                      !formData.municipality_id ||
                      b.municipality_id === parseInt(formData.municipality_id)
                  )
                  .map((barangay) => (
                    <option key={barangay.id} value={barangay.id}>
                      {barangay.barangay}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* <div className="form-row">
            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">
                  Latitude
                </Text>
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 13.6191"
              />
            </div>

            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">
                  Longitude
                </Text>
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 123.1814"
              />
            </div>
          </div> */}

          <div className="form-row">
            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">
                  Contact Information
                </Text>
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Mobile Number"
              />
            </div>

            <div className="form-group">
              <label>
                <Text variant="label" color="white">
                  placeholder
                </Text>
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Email"
              />
            </div>
            <div className="form-group">
              <label>
                <Text variant="label" color="white">
                  placeholder
                </Text>
              </label>  
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Links"
              />
            </div>
          </div>

          <div className="form-row1">
            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">
                  Category
                </Text>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Text variant="label" color="text-color">
                  Entry Fee (₱)
                </Text>
              </label>
              <input
                type="number"
                step="0.01"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={handleInputChange}
                className="form-input"
                placeholder="(if applicable)"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              <Text variant="normal" color="text-color">
                Cancel
              </Text>
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              <Text variant="normal" color="white">
                {loading 
                  ? (mode === 'add' ? "Adding..." : "Updating...") 
                  : (mode === 'add' ? "Add Spot" : "Update Spot")
                }
              </Text>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TouristSpotForm;
