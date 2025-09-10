import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
  Input,
} from "@mui/joy";
import { updateData } from "@/src/api_function";
import CardHeader from "@/src/components/CardHeader";
import { useAddress } from "@/src/hooks/useAddress";
import { api } from "@/src/services/BusinessService";
import axios from "axios";
import { Streetview } from "@mui/icons-material";

interface EditDescriptionModalProps {
  open: boolean;
  initialProvince?: number;
  initialMunicipality?: number;
  initialBarangay?: number;
  initialAddress?: string;
  businessId?: string;
  addressId?: number;
  onClose: () => void;
  onSave: (
    province_id: number,
    municipality_id: number,
    barangay_id: number,
    address: string
  ) => void;
  onUpdate?: () => void;
}

const EditAddressModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialProvince = 0,
  initialMunicipality = 0,
  initialBarangay = 0,
  initialAddress = "",
  businessId,
  addressId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [province_id, setProvinceId] = React.useState(initialProvince);
  const [municipality_id, setMunicipalityId] =
    React.useState(initialMunicipality);
  const [barangay_id, setBarangayId] = React.useState(initialBarangay);
  const [address, setAddress] = React.useState(initialAddress);

  const [province, setProvince] = React.useState<
    { id: number; province: string }[]
  >([]);
  const [municipality, setMunicipality] = React.useState<
    { id: number; municipality: string }[]
  >([]);
  const [barangay, setBarangay] = React.useState<
    { id: number; barangay: string }[]
  >([]);

  const fetchProvince = async () => {
    try {
      const response = await axios.get(`${api}/address/provinces`);
      if (Array.isArray(response.data)) {
        setProvince(response.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchMunicipality = async (provinceId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/municipalities/${provinceId}`
      );
      if (Array.isArray(response.data)) {
        setMunicipality(response.data);
      }
    } catch (error) {
      console.error("Error fetching municipalities:", error);
    }
  };

  const fetchBarangay = async (municipalityId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/barangays/${municipalityId}`
      );
      if (Array.isArray(response.data)) {
        setBarangay(response.data);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  React.useEffect(() => {
    fetchProvince();
  }, []);

  React.useEffect(() => {
    if (province_id) {
      fetchMunicipality(province_id);
      setMunicipalityId(0);
      setBarangayId(0);
    }
  }, [province_id]);

  React.useEffect(() => {
    if (municipality_id) {
      fetchBarangay(municipality_id);
      setBarangayId(0);
    }
  }, [municipality_id]);

  React.useEffect(() => {
    setProvinceId(initialProvince);
    setMunicipalityId(initialMunicipality);
    setBarangayId(initialBarangay);
    setAddress(initialAddress);
  }, [
    initialProvince,
    initialMunicipality,
    initialBarangay,
    initialAddress,
    open,
  ]);

  const handleSave = async () => {
    if (businessId && addressId) {
      try {
        await updateData(
          addressId,
          { province_id, municipality_id, barangay_id },
          "address"
        );

        await updateData(businessId, { address }, "business");
        onSave(province_id, municipality_id, barangay_id, address);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(province_id, municipality_id, barangay_id, address);
    }
    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Location" color="white" />
        <DialogContent>
          <FormControl>
            <FormLabel>Province</FormLabel>
            <Select
              size="md"
              placeholder="-- Select a province --"
              value={province_id}
              onChange={(_, value) => setProvinceId(Number(value))}
            >
              <Option value="">-- Select province --</Option>
              {province.map((province) => (
                <Option key={province.id} value={province.id}>
                  {province.province}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Municipality</FormLabel>
            <Select
              size="md"
              placeholder="-- Select municipality --"
              value={municipality_id}
              onChange={(_, value) => setMunicipalityId(Number(value))}
              disabled={!province_id}
            >
              <Option value="">-- Select municipality --</Option>
              {municipality.map((municipality) => (
                <Option key={municipality.id} value={municipality.id}>
                  {municipality.municipality}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Barangay</FormLabel>
            <Select
              size="md"
              placeholder="-- Select barangay --"
              value={barangay_id}
              onChange={(_, value) => setBarangayId(Number(value))}
              disabled={!municipality_id}
            >
              <Option value="">-- Select barangay --</Option>
              {barangay.map((barangay) => (
                <Option key={barangay.id} value={barangay.id}>
                  {barangay.barangay}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              type="text"
              size="md"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth color="primary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default EditAddressModal;
