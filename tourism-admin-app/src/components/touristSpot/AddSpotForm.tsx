import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Text from "../Text";
import { apiService } from "../../utils/api";
import type {
  Type,
  Province,
  Municipality,
  Barangay,
} from "../../types/TouristSpot";
import "../styles/AddSpotForm.css";

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
    category_id: "3", // Always set to 3 for tourist spots
    type_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<Type[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

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

  // Load categories, types, and location data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesTypes, locationData] = await Promise.all([
          apiService.getCategoriesAndTypes(),
          apiService.getLocationData(),
        ]);

        setTypes(categoriesTypes.types);
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
      await apiService.createTouristSpot({
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
        type_id: parseInt(formData.type_id),
      });

      alert("Spot added successfully!");
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
        category_id: "3", // Always reset to 3 for tourist spots
        type_id: "",
      });
      onSpotAdded();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding spot. Please try again.");
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
                name="longitude"
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
                {loading ? "Adding..." : "Add Spot"}
              </Text>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpotForm;
