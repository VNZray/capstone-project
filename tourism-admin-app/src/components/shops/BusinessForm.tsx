import * as React from 'react';
import { DialogTitle, DialogContent, Modal, ModalDialog, Stack, FormControl, FormLabel, Input, Textarea, Select, Option, Button, Typography, Box, Divider, Sheet } from '@mui/joy';
import { LocationOn, Language, Facebook, Instagram, Twitter } from '@mui/icons-material';
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
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  x_url: string;
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
  website_url: '',
  facebook_url: '',
  instagram_url: '',
  x_url: '',
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
  const [step, setStep] = React.useState<number>(1);

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
  website_url: initial.website_url || '',
  facebook_url: initial.facebook_url || '',
  instagram_url: initial.instagram_url || '',
  x_url: initial.x_url || '',
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

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (!form.business_name.trim()) next.business_name = 'Required';
      if (!form.email.trim()) next.email = 'Required';
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Invalid email';
      if (!form.phone_number.trim()) next.phone_number = 'Required';
      if (!form.business_type_id) next.business_type_id = 'Select a type';
      if (!form.business_category_id) next.business_category_id = 'Select a category';
      if (!form.min_price.trim()) next.min_price = 'Required';
      if (!form.max_price.trim()) next.max_price = 'Required';
      const minVal = parseFloat(form.min_price);
      const maxVal = parseFloat(form.max_price);
      if (form.min_price && isNaN(minVal)) next.min_price = 'Invalid';
      if (form.max_price && isNaN(maxVal)) next.max_price = 'Invalid';
      if (!next.min_price && !next.max_price && !isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
        next.max_price = 'Must be ≥ Min';
      }
    } else if (s === 2) {
      if (!form.province_id) next.province_id = 'Select province';
      if (!form.municipality_id) next.municipality_id = 'Select municipality';
      if (!form.barangay_id) next.barangay_id = 'Select barangay';
      if (!form.address.trim()) next.address = 'Required';
      if (!form.latitude.trim()) next.latitude = 'Required';
      if (!form.longitude.trim()) next.longitude = 'Required';
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
  website_url: form.website_url || null,
  facebook_url: form.facebook_url || null,
  instagram_url: form.instagram_url || null,
  x_url: form.x_url || null,
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

  const handleNext = () => {
  if (!validateStep(step)) return;
  setStep((s) => Math.min(6, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ 
        width: { xs: '95vw', sm: 800, md: 900 }, 
        maxWidth: '95vw', 
        maxHeight: '95vh',
        mx: 'auto', 
        my: { xs: 1, sm: 2 }, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: { xs: 12, sm: 16 },
        boxShadow: { xs: 'lg', sm: 'xl' },
        border: 'none',
        overflow: 'hidden'
      }}>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface'
        }}>
          <Typography level="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {mode === 'create' ? 'Add New Shop' : 'Edit Shop'}
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 500 }}>
            Step {step} of 6
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          overflow: 'hidden', 
          p: 0
        }}>
          {/* Progress Stepper */}
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.surface'
          }}>
            <Stack direction="row" sx={{ position: 'relative' }}>
              {/* Progress line */}
              <Box sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                height: 2,
                bgcolor: 'neutral.100',
                borderRadius: 1,
                zIndex: 0
              }}>
                <Box sx={{
                  height: '100%',
                  bgcolor: 'primary.500',
                  borderRadius: 1,
                  width: `${((step - 1) / 5) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </Box>
              
              {['Basic', 'Location', 'Socials', 'Hours', 'Images', 'Review'].map((label, idx) => {
                const target = idx + 1;
                const completed = step > target;
                const active = step === target;
                return (
                  <Box key={label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Box
                      onClick={() => {
                        if (target === step) return;
                        if (target > step && !validateStep(step)) return;
                        setStep(target);
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: completed ? 'success.500' : active ? 'primary.500' : 'background.body',
                        color: completed || active ? 'white' : 'text.tertiary',
                        border: completed || active ? 'none' : '2px solid',
                        borderColor: 'neutral.200',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 'sm'
                        }
                      }}
                    >
                      {completed ? '✓' : target}
                    </Box>
                    <Typography 
                      level="body-xs" 
                      sx={{ 
                        mt: 1, 
                        color: active ? 'primary.500' : completed ? 'success.500' : 'text.tertiary',
                        fontWeight: active ? 600 : 400,
                        fontSize: '0.75rem'
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>

            {/* Step contents */}
            {step === 1 && (
              <Stack gap={3}>
                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Basic Information
                  </Typography>
                  
                  <Stack gap={2}>
                    <FormControl error={!!errors.business_name}>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Business Name *</FormLabel>
                      <Input 
                        value={form.business_name} 
                        onChange={(e) => setField('business_name', e.target.value)}
                        placeholder="Enter your shop name"
                        sx={{ 
                          '--Input-radius': '8px',
                          '--Input-minHeight': '44px',
                          fontSize: '0.95rem'
                        }}
                      />
                      {errors.business_name && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.business_name}</Typography>}
                    </FormControl>

                    <FormControl>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Description</FormLabel>
                      <Textarea 
                        minRows={3} 
                        value={form.description} 
                        onChange={(e) => setField('description', e.target.value)} 
                        placeholder="Brief description of your shop..."
                        sx={{ 
                          '--Textarea-radius': '8px',
                          fontSize: '0.95rem'
                        }}
                      />
                    </FormControl>
                  </Stack>
                </Box>

                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Contact Details
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                    <FormControl error={!!errors.email} sx={{ flex: 1 }}>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Email Address *</FormLabel>
                      <Input 
                        type="email"
                        value={form.email} 
                        onChange={(e) => setField('email', e.target.value)}
                        placeholder="shop@example.com"
                        sx={{ 
                          '--Input-radius': '8px',
                          '--Input-minHeight': '44px',
                          fontSize: '0.95rem'
                        }}
                      />
                      {errors.email && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.email}</Typography>}
                    </FormControl>
                    <FormControl error={!!errors.phone_number} sx={{ flex: 1 }}>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Phone Number *</FormLabel>
                      <Input 
                        value={form.phone_number} 
                        onChange={(e) => setField('phone_number', e.target.value)}
                        placeholder="+63 900 000 0000"
                        sx={{ 
                          '--Input-radius': '8px',
                          '--Input-minHeight': '44px',
                          fontSize: '0.95rem'
                        }}
                      />
                      {errors.phone_number && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.phone_number}</Typography>}
                    </FormControl>
                  </Stack>
                </Box>

                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Classification & Pricing
                  </Typography>
                  
                  <Stack gap={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                      <FormControl error={!!errors.business_type_id} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Business Type *</FormLabel>
                        {mode === 'create' ? (
                          <Select 
                            value={form.business_type_id === '' ? null : form.business_type_id} 
                            disabled
                            sx={{ 
                              '--Select-radius': '8px',
                              '--Select-minHeight': '44px',
                              fontSize: '0.95rem'
                            }}
                          >
                            {types.filter(t => (t.type.toLowerCase() === 'shop')).map(t => (
                              <Option key={t.id} value={t.id}>{t.type}</Option>
                            ))}
                          </Select>
                        ) : (
                          <Select 
                            value={form.business_type_id === '' ? null : form.business_type_id} 
                            placeholder="Select type" 
                            onChange={(_, v) => setField('business_type_id', (v as number) ?? '')}
                            sx={{ 
                              '--Select-radius': '8px',
                              '--Select-minHeight': '44px',
                              fontSize: '0.95rem'
                            }}
                          >
                            {types.map((t) => (
                              <Option key={t.id} value={t.id}>{t.type}</Option>
                            ))}
                          </Select>
                        )}
                        {errors.business_type_id && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.business_type_id}</Typography>}
                      </FormControl>
                      <FormControl error={!!errors.business_category_id} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Category *</FormLabel>
                        <Select 
                          value={form.business_category_id === '' ? null : form.business_category_id} 
                          placeholder="Select category" 
                          onChange={(_, v) => setField('business_category_id', (v as number) ?? '')} 
                          disabled={!form.business_type_id}
                          sx={{ 
                            '--Select-radius': '8px',
                            '--Select-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        >
                          {categories.map((c) => (
                            <Option key={c.id} value={c.id}>{c.category}</Option>
                          ))}
                        </Select>
                        {errors.business_category_id && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.business_category_id}</Typography>}
                      </FormControl>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="end">
                      <FormControl error={!!errors.min_price} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Min Price (₱) *</FormLabel>
                        <Input 
                          type="number" 
                          value={form.min_price} 
                          onChange={(e) => setField('min_price', e.target.value)}
                          placeholder="0.00"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                        {errors.min_price && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.min_price}</Typography>}
                      </FormControl>
                      <FormControl error={!!errors.max_price} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Max Price (₱) *</FormLabel>
                        <Input 
                          type="number" 
                          value={form.max_price} 
                          onChange={(e) => setField('max_price', e.target.value)}
                          placeholder="0.00"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                        {errors.max_price && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.max_price}</Typography>}
                      </FormControl>
                      <FormControl error={!!errors.status} sx={{ minWidth: 140 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Status *</FormLabel>
                        <Select 
                          value={form.status} 
                          onChange={(_, v) => v && setField('status', v as BusinessStatus)}
                          sx={{ 
                            '--Select-radius': '8px',
                            '--Select-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        >
                          {['Pending', 'Active', 'Inactive', 'Maintenance'].map((s) => (
                            <Option key={s} value={s}>{s}</Option>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            )}

            {step === 2 && (
              <Stack gap={3}>
                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Location Information
                  </Typography>
                  
                  <Stack gap={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                      <FormControl error={!!errors.province_id} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Province *</FormLabel>
                        <Select 
                          value={form.province_id === '' ? null : form.province_id} 
                          placeholder="Select Province" 
                          onChange={(_, v) => setField('province_id', (v as number) ?? '')}
                          sx={{ 
                            '--Select-radius': '8px',
                            '--Select-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        >
                          {provinceOptions.map((p) => (
                            <Option key={p.id} value={p.id}>{p.province}</Option>
                          ))}
                        </Select>
                        {errors.province_id && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.province_id}</Typography>}
                      </FormControl>
                      <FormControl error={!!errors.municipality_id} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Municipality *</FormLabel>
                        <Select 
                          value={form.municipality_id === '' ? null : form.municipality_id} 
                          placeholder="Select Municipality" 
                          onChange={(_, v) => setField('municipality_id', (v as number) ?? '')} 
                          disabled={!form.province_id}
                          sx={{ 
                            '--Select-radius': '8px',
                            '--Select-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        >
                          {municipalityOptions.map((m) => (
                            <Option key={m.id} value={m.id}>{m.municipality}</Option>
                          ))}
                        </Select>
                        {errors.municipality_id && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.municipality_id}</Typography>}
                      </FormControl>
                      <FormControl error={!!errors.barangay_id} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Barangay *</FormLabel>
                        <Select 
                          value={form.barangay_id === '' ? null : form.barangay_id} 
                          placeholder="Select Barangay" 
                          onChange={(_, v) => setField('barangay_id', (v as number) ?? '')} 
                          disabled={!form.municipality_id}
                          sx={{ 
                            '--Select-radius': '8px',
                            '--Select-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        >
                          {barangayOptions.map((b) => (
                            <Option key={b.id} value={b.id}>{b.barangay}</Option>
                          ))}
                        </Select>
                        {errors.barangay_id && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.barangay_id}</Typography>}
                      </FormControl>
                    </Stack>

                    <FormControl error={!!errors.address}>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Street Address *</FormLabel>
                      <Input 
                        value={form.address} 
                        onChange={(e) => setField('address', e.target.value)} 
                        placeholder="e.g., Hilda St, Poblacion"
                        startDecorator={<LocationOn sx={{ color: 'text.tertiary' }} />}
                        sx={{ 
                          '--Input-radius': '8px',
                          '--Input-minHeight': '44px',
                          fontSize: '0.95rem'
                        }}
                      />
                      {errors.address && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.address}</Typography>}
                    </FormControl>

                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                      <FormControl error={!!errors.latitude} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Latitude *</FormLabel>
                        <Input 
                          value={form.latitude} 
                          onChange={(e) => setField('latitude', e.target.value)} 
                          placeholder="13.6218"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                        {errors.latitude && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.latitude}</Typography>}
                      </FormControl>
                      <FormControl error={!!errors.longitude} sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Longitude *</FormLabel>
                        <Input 
                          value={form.longitude} 
                          onChange={(e) => setField('longitude', e.target.value)} 
                          placeholder="123.1948"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                        {errors.longitude && <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{errors.longitude}</Typography>}
                      </FormControl>
                    </Stack>

                    {form.latitude && form.longitude && (
                      <Box sx={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '16 / 9', border: '1px solid', borderColor: 'divider' }}>
                        <iframe
                          title="map-preview"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(form.latitude)},${encodeURIComponent(form.longitude)}&z=16&output=embed`}
                        />
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Stack>
            )}

            {step === 3 && (
              <Stack gap={3}>
                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Social Media & Website
                  </Typography>
                  
                  <Stack gap={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                      <FormControl sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Facebook Page</FormLabel>
                        <Input 
                          startDecorator={<Facebook sx={{ color: '#1877F2' }} />} 
                          value={form.facebook_url} 
                          onChange={(e) => setField('facebook_url', e.target.value)} 
                          placeholder="https://facebook.com/yourpage"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </FormControl>
                      <FormControl sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Instagram</FormLabel>
                        <Input 
                          startDecorator={<Instagram sx={{ color: '#E4405F' }} />} 
                          value={form.instagram_url} 
                          onChange={(e) => setField('instagram_url', e.target.value)} 
                          placeholder="https://instagram.com/yourpage"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </FormControl>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                      <FormControl sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Twitter/X</FormLabel>
                        <Input 
                          startDecorator={<Twitter sx={{ color: '#1DA1F2' }} />} 
                          value={form.x_url} 
                          onChange={(e) => setField('x_url', e.target.value)} 
                          placeholder="https://x.com/yourhandle"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </FormControl>
                      <FormControl sx={{ flex: 1 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Website</FormLabel>
                        <Input 
                          startDecorator={<Language sx={{ color: 'text.tertiary' }} />} 
                          value={form.website_url} 
                          onChange={(e) => setField('website_url', e.target.value)} 
                          placeholder="https://yourwebsite.com"
                          sx={{ 
                            '--Input-radius': '8px',
                            '--Input-minHeight': '44px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            )}

            {step === 4 && (
              <Stack gap={3}>
                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Business Hours
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 3 }}>
                    Operating hours configuration will be implemented in future updates.
                  </Typography>
                  <FormControl>
                    <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Notes</FormLabel>
                    <Input 
                      value={''} 
                      placeholder="e.g. Mon-Fri 9:00-18:00" 
                      disabled
                      sx={{ 
                        '--Input-radius': '8px',
                        '--Input-minHeight': '44px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </FormControl>
                </Box>
              </Stack>
            )}

            {step === 5 && (
              <Stack gap={3}>
                <Box>
                  <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                    Images
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 3 }}>
                    Upload gallery images later. For now you can add an image URL.
                  </Typography>
                  <FormControl>
                    <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Image URL</FormLabel>
                    <Input 
                      value={form.business_image} 
                      onChange={(e) => setField('business_image', e.target.value)} 
                      placeholder="https://..."
                      sx={{ 
                        '--Input-radius': '8px',
                        '--Input-minHeight': '44px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </FormControl>
                  {form.business_image && (
                    <Box sx={{ mt: 2, borderRadius: 8, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <img 
                        src={form.business_image} 
                        alt="Preview" 
                        style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            )}

            {step === 6 && (
              <Stack gap={3}>
                <Box>
                  <Typography level="title-md" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                    Review & Confirm
                  </Typography>
                  <Sheet variant="outlined" sx={{ p: 3, borderRadius: 12, bgcolor: 'background.surface' }}>
                    <Stack gap={2}>
                      <Box>
                        <Typography level="title-lg" fontWeight={700}>{form.business_name || 'Untitled Shop'}</Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>{form.address || 'No address provided'}</Typography>
                      </Box>
                      <Divider />
                      <Stack direction="row" gap={4}>
                        <Box sx={{ flex: 1 }}>
                          <Typography level="body-sm" fontWeight={600}>Contact</Typography>
                          <Typography level="body-xs">{form.email}</Typography>
                          <Typography level="body-xs">{form.phone_number}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography level="body-sm" fontWeight={600}>Category</Typography>
                          <Typography level="body-xs">{categories.find(c => c.id === form.business_category_id)?.category || '-'}</Typography>
                        </Box>
                      </Stack>
                      <Box>
                        <Typography level="body-sm" fontWeight={600}>Price Range</Typography>
                        <Typography level="body-xs">₱{form.min_price || '0'} - ₱{form.max_price || '0'}</Typography>
                      </Box>
                      {form.description && (
                        <Box>
                          <Typography level="body-sm" fontWeight={600}>Description</Typography>
                          <Typography level="body-xs">{form.description}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Sheet>
                </Box>
              </Stack>
            )}
            </Box>

            {/* Navigation */}
            <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button 
                  variant="plain" 
                  onClick={() => { onClose(); setStep(1); }} 
                  disabled={submitting}
                  sx={{ fontWeight: 600 }}
                >
                  Cancel
                </Button>
                <Stack direction="row" gap={1}>
                  {step > 1 && (
                    <Button 
                      variant="outlined" 
                      onClick={handleBack}
                      sx={{ fontWeight: 600 }}
                    >
                      Back
                    </Button>
                  )}
                  {step < 6 ? (
                    <Button 
                      onClick={handleNext}
                      sx={{ fontWeight: 600, minWidth: 80 }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      loading={submitting} 
                      onClick={async () => { await handleSubmit(); setStep(1); }}
                      sx={{ fontWeight: 600, minWidth: 120 }}
                    >
                      {mode === 'create' ? 'Create Shop' : 'Save Changes'}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default BusinessForm;
