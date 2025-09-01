import * as React from 'react';
import { DialogTitle, DialogContent, Modal, ModalDialog, Stack, FormControl, FormLabel, Input, Select, Option, Button, Typography } from '@mui/joy';
import type { Business, BusinessStatus, CategoryOption, TypeOption } from '@/src/types/Business';
import { BusinessService } from '@/src/services/BusinessService';

interface BusinessFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<Business> | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  business_name: string;
  email: string;
  phone_number: string;
  business_type_id: number | '';
  business_category_id: number | '';
  province_id: number | '';
  municipality_id: number | '';
  barangay_id: number | '';
  address: string;
  description: string;
  status: BusinessStatus;
  latitude: string;
  longitude: string;
  business_image: string;
  min_price: string; // keep as string for input then parse
  max_price: string;
}

const emptyForm: FormState = {
  business_name: '',
  email: '',
  phone_number: '',
  business_type_id: '',
  business_category_id: '',
  province_id: '',
  municipality_id: '',
  barangay_id: '',
  address: '',
  description: '',
  status: 'Pending',
  latitude: '',
  longitude: '',
  business_image: '',
  min_price: '',
  max_price: '',
};

export const BusinessForm: React.FC<BusinessFormProps> = ({ open, mode, initial, onClose, onSaved }) => {
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [types, setTypes] = React.useState<TypeOption[]>([]);
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [provinceOptions, setProvinceOptions] = React.useState<{ id: number; province: string }[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = React.useState<{ id: number; municipality: string; province_id: number }[]>([]);
  const [barangayOptions, setBarangayOptions] = React.useState<{ id: number; barangay: string; municipality_id: number }[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  // Load types & provinces on open and auto-select Shop type for create mode
  React.useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [t, prov] = await Promise.all([
          BusinessService.getBusinessTypes(),
          BusinessService.getProvinces(),
        ]);
        setTypes(t);
        setProvinceOptions(prov);
        if (mode === 'create') {
          const shopType = t.find((tt) => tt.type.toLowerCase() === 'shop');
          if (shopType) {
            setForm((prev) => ({
              ...prev,
              business_type_id: shopType.id,
              business_category_id: '', // reset category when type set
            }));
            // Preload categories for shop
            const cat = await BusinessService.getCategoriesByTypeId(shopType.id);
            setCategories(cat);
          }
        }
      } catch (e) {
        console.error('Failed loading types/provinces', e);
      }
    })();
  }, [open, mode]);

  // Populate form in edit mode
  React.useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm((prev) => ({
        ...prev,
        business_name: initial.business_name || '',
        email: initial.email || '',
        phone_number: initial.phone_number || '',
        business_type_id: initial.business_type_id ?? '',
        business_category_id: initial.business_category_id ?? '',
        province_id: initial.province_id ?? '',
        municipality_id: initial.municipality_id ?? '',
        barangay_id: initial.barangay_id ?? '',
        address: initial.address || '',
        description: initial.description || '',
        status: initial.status || 'Pending',
        latitude: initial.latitude || '',
        longitude: initial.longitude || '',
        business_image: initial.business_image || '',
  min_price: initial.min_price != null ? String(initial.min_price) : '',
  max_price: initial.max_price != null ? String(initial.max_price) : '',
      }));
    } else if (mode === 'create' && open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [mode, initial, open]);

  // Fetch categories when type changes
  React.useEffect(() => {
    if (form.business_type_id === '' || form.business_type_id == null) {
      setCategories([]);
      return;
    }
    (async () => {
      try {
        const cat = await BusinessService.getCategoriesByTypeId(form.business_type_id as number);
        setCategories(cat);
      } catch (e) {
        console.error('Failed loading categories', e);
      }
    })();
  }, [form.business_type_id]);

  // Fetch municipalities when province changes
  React.useEffect(() => {
    if (form.province_id === '' || form.province_id == null) {
      setMunicipalityOptions([]);
      return;
    }
    (async () => {
      const m = await BusinessService.getMunicipalitiesByProvince(form.province_id as number);
      setMunicipalityOptions(m);
    })();
  }, [form.province_id]);

  // Fetch barangays when municipality changes
  React.useEffect(() => {
    if (form.municipality_id === '' || form.municipality_id == null) {
      setBarangayOptions([]);
      return;
    }
    (async () => {
      const b = await BusinessService.getBarangaysByMunicipality(form.municipality_id as number);
      setBarangayOptions(b);
    })();
  }, [form.municipality_id]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.business_name.trim()) next.business_name = 'Required';
    if (!form.email.trim()) next.email = 'Required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Invalid email';
    if (!form.phone_number.trim()) next.phone_number = 'Required';
    if (!form.business_type_id) next.business_type_id = 'Select a type';
    if (!form.business_category_id) next.business_category_id = 'Select a category';
    if (!form.province_id) next.province_id = 'Select province';
    if (!form.municipality_id) next.municipality_id = 'Select municipality';
    if (!form.barangay_id) next.barangay_id = 'Select barangay';
    if (!form.address.trim()) next.address = 'Required';
    if (!form.latitude.trim()) next.latitude = 'Required';
    if (!form.longitude.trim()) next.longitude = 'Required';
    if (!form.min_price.trim()) next.min_price = 'Required';
    if (!form.max_price.trim()) next.max_price = 'Required';
    const minVal = parseFloat(form.min_price);
    const maxVal = parseFloat(form.max_price);
    if (form.min_price && isNaN(minVal)) next.min_price = 'Invalid';
    if (form.max_price && isNaN(maxVal)) next.max_price = 'Invalid';
    if (!next.min_price && !next.max_price && !isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
      next.max_price = 'Must be ≥ Min';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: Partial<Business> = {
        business_name: form.business_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        business_type_id: form.business_type_id as number,
        business_category_id: form.business_category_id as number,
        province_id: form.province_id as number,
        municipality_id: form.municipality_id as number,
        barangay_id: form.barangay_id as number,
        address: form.address.trim(),
        description: form.description.trim() || null,
        status: form.status,
        latitude: form.latitude.trim(),
        longitude: form.longitude.trim(),
        business_image: form.business_image || null,
  min_price: parseFloat(form.min_price),
  max_price: parseFloat(form.max_price),
  hasBooking: false, // Shops default: no booking capability
      };
      if (mode === 'create') {
        await BusinessService.create(payload);
      } else if (mode === 'edit' && initial?.id) {
        await BusinessService.update(initial.id, payload);
      }
      onSaved();
    } catch (e) {
      // Show generic error (could extend to toast)
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="fullscreen" sx={{ maxWidth: 760 }}>
        <DialogTitle>{mode === 'create' ? 'Add Shop' : 'Edit Shop'}</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl error={!!errors.business_name} sx={{ flex: 1 }}>
                <FormLabel>Business Name *</FormLabel>
                <Input value={form.business_name} onChange={(e) => setField('business_name', e.target.value)} />
                {errors.business_name && <Typography level="body-xs" color="danger">{errors.business_name}</Typography>}
              </FormControl>
              <FormControl error={!!errors.email} sx={{ flex: 1 }}>
                <FormLabel>Email *</FormLabel>
                <Input value={form.email} onChange={(e) => setField('email', e.target.value)} />
                {errors.email && <Typography level="body-xs" color="danger">{errors.email}</Typography>}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl error={!!errors.phone_number} sx={{ flex: 1 }}>
                <FormLabel>Phone *</FormLabel>
                <Input value={form.phone_number} onChange={(e) => setField('phone_number', e.target.value)} />
                {errors.phone_number && <Typography level="body-xs" color="danger">{errors.phone_number}</Typography>}
              </FormControl>
              <FormControl error={!!errors.status} sx={{ width: 180 }}>
                <FormLabel>Status *</FormLabel>
                <Select value={form.status} onChange={(_, v) => v && setField('status', v as BusinessStatus)}>
                  {['Pending', 'Active', 'Inactive', 'Maintenance'].map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl error={!!errors.business_type_id} sx={{ flex: 1 }}>
                <FormLabel>Type *</FormLabel>
                {mode === 'create' ? (
                  <Select
                    value={form.business_type_id === '' ? null : form.business_type_id}
                    disabled
                  >
                    {/* show only the auto-selected Shop type */}
                    {types.filter(t => (t.type.toLowerCase() === 'shop')).map(t => (
                      <Option key={t.id} value={t.id}>{t.type}</Option>
                    ))}
                  </Select>
                ) : (
                  <Select
                    value={form.business_type_id === '' ? null : form.business_type_id}
                    placeholder="Select type"
                    onChange={(_, v) => setField('business_type_id', (v as number) ?? '')}
                  >
                    {types.map((t) => (
                      <Option key={t.id} value={t.id}>{t.type}</Option>
                    ))}
                  </Select>
                )}
                {errors.business_type_id && <Typography level="body-xs" color="danger">{errors.business_type_id}</Typography>}
              </FormControl>
              <FormControl error={!!errors.business_category_id} sx={{ flex: 1 }}>
                <FormLabel>Category *</FormLabel>
                <Select
                  value={form.business_category_id === '' ? null : form.business_category_id}
                  placeholder="Select category"
                  onChange={(_, v) => setField('business_category_id', (v as number) ?? '')}
                  disabled={!form.business_type_id}
                >
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>{c.category}</Option>
                  ))}
                </Select>
                {errors.business_category_id && <Typography level="body-xs" color="danger">{errors.business_category_id}</Typography>}
              </FormControl>
            </Stack>

            <FormControl error={!!errors.address}>
              <FormLabel>Address *</FormLabel>
              <Input value={form.address} onChange={(e) => setField('address', e.target.value)} />
              {errors.address && <Typography level="body-xs" color="danger">{errors.address}</Typography>}
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl error={!!errors.province_id} sx={{ flex: 1 }}>
                <FormLabel>Province *</FormLabel>
                <Select
                  value={form.province_id === '' ? null : form.province_id}
                  placeholder="Province"
                  onChange={(_, v) => setField('province_id', (v as number) ?? '')}
                >
                  {provinceOptions.map((p) => (
                    <Option key={p.id} value={p.id}>{p.province}</Option>
                  ))}
                </Select>
                {errors.province_id && <Typography level="body-xs" color="danger">{errors.province_id}</Typography>}
              </FormControl>
              <FormControl error={!!errors.municipality_id} sx={{ flex: 1 }}>
                <FormLabel>Municipality *</FormLabel>
                <Select
                  value={form.municipality_id === '' ? null : form.municipality_id}
                  placeholder="Municipality"
                  onChange={(_, v) => setField('municipality_id', (v as number) ?? '')}
                  disabled={!form.province_id}
                >
                  {municipalityOptions.map((m) => (
                    <Option key={m.id} value={m.id}>{m.municipality}</Option>
                  ))}
                </Select>
                {errors.municipality_id && <Typography level="body-xs" color="danger">{errors.municipality_id}</Typography>}
              </FormControl>
              <FormControl error={!!errors.barangay_id} sx={{ flex: 1 }}>
                <FormLabel>Barangay *</FormLabel>
                <Select
                  value={form.barangay_id === '' ? null : form.barangay_id}
                  placeholder="Barangay"
                  onChange={(_, v) => setField('barangay_id', (v as number) ?? '')}
                  disabled={!form.municipality_id}
                >
                  {barangayOptions.map((b) => (
                    <Option key={b.id} value={b.id}>{b.barangay}</Option>
                  ))}
                </Select>
                {errors.barangay_id && <Typography level="body-xs" color="danger">{errors.barangay_id}</Typography>}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl error={!!errors.latitude} sx={{ flex: 1 }}>
                <FormLabel>Latitude *</FormLabel>
                <Input value={form.latitude} onChange={(e) => setField('latitude', e.target.value)} />
                {errors.latitude && <Typography level="body-xs" color="danger">{errors.latitude}</Typography>}
              </FormControl>
              <FormControl error={!!errors.longitude} sx={{ flex: 1 }}>
                <FormLabel>Longitude *</FormLabel>
                <Input value={form.longitude} onChange={(e) => setField('longitude', e.target.value)} />
                {errors.longitude && <Typography level="body-xs" color="danger">{errors.longitude}</Typography>}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl error={!!errors.min_price} sx={{ flex: 1 }}>
                <FormLabel>Min Price *</FormLabel>
                <Input type='number' value={form.min_price} onChange={(e) => setField('min_price', e.target.value)} />
                {errors.min_price && <Typography level="body-xs" color="danger">{errors.min_price}</Typography>}
              </FormControl>
              <FormControl error={!!errors.max_price} sx={{ flex: 1 }}>
                <FormLabel>Max Price *</FormLabel>
                <Input type='number' value={form.max_price} onChange={(e) => setField('max_price', e.target.value)} />
                {errors.max_price && <Typography level="body-xs" color="danger">{errors.max_price}</Typography>}
              </FormControl>
            </Stack>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </FormControl>

            <Stack direction='row' gap={1} justifyContent='flex-end'>
              <Button variant='plain' onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
                {mode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default BusinessForm;
