import React, { useEffect, useMemo, useState } from "react";
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, FormControl, FormLabel, Input, Select, Option, Stack, Checkbox } from "@mui/joy";
import Button from "@/src/components/Button";
import type { TourismStaff } from "@/src/types/TourismStaff";

type RoleOption = { id: number; name: string };

type Props = {
  open: boolean;
  loading?: boolean;
  mode: 'create' | 'edit';
  staff?: TourismStaff | null;
  roles: RoleOption[];
  onClose: () => void;
  onSubmit: (payload: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    position?: string | null;
    email: string;
    phone_number: string;
    role_id?: number;
    role_name?: string;
    is_active?: boolean;
    is_verified?: boolean;
  }) => Promise<void> | void;
};

const EditStaffModal: React.FC<Props> = ({
  open,
  loading = false,
  mode,
  staff,
  roles,
  onClose,
  onSubmit,
}) => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (open) {
      if (staff && mode === 'edit') {
        setFirstName(staff.first_name || "");
        setMiddleName(staff.middle_name || "");
        setLastName(staff.last_name || "");
        setPosition(staff.position || "");
        setEmail(staff.email || "");
        setPhone(staff.phone_number || "");
        setIsActive(Boolean(staff.is_active));
        setIsVerified(Boolean(staff.is_verified));
        const matched = roles.find(r => r.name.toLowerCase() === (staff.role_name || '').toLowerCase());
        setRoleId(matched?.id);
      } else {
        // reset for create
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setPosition("");
        setEmail("");
        setPhone("");
        setIsActive(true);
        setIsVerified(false);
        setRoleId(undefined);
      }
    }
  }, [open, staff, mode, roles]);

  const canSubmit = useMemo(() => {
    return firstName.trim() && lastName.trim() && email.trim() && phone.trim() && Boolean(roleId);
  }, [firstName, lastName, email, phone, roleId]);

  const submit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      first_name: firstName.trim(),
      middle_name: middleName.trim() || undefined,
      last_name: lastName.trim(),
      position: position.trim() || undefined,
      email: email.trim(),
      phone_number: phone.trim(),
      role_id: roleId,
      is_active: isActive,
      is_verified: isVerified,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" sx={{ minWidth: 520 }}>
        <DialogTitle>{mode === 'create' ? 'Add Staff' : 'Edit Staff'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>First Name</FormLabel>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Middle Name</FormLabel>
                <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Last Name</FormLabel>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </FormControl>
            </Stack>

            <FormControl>
              <FormLabel>Position</FormLabel>
              <Input value={position} onChange={(e) => setPosition(e.target.value)} />
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Phone</FormLabel>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FormControl>
            </Stack>

            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select value={roleId ?? null} onChange={(_, v) => setRoleId((v as number) ?? undefined)}>
                {roles.map((r) => (
                  <Option key={r.id} value={r.id}>{r.name}</Option>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <Checkbox label="Active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <Checkbox label="Verified" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" colorScheme="primary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="solid" colorScheme="primary" onClick={submit} disabled={!canSubmit || loading}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default EditStaffModal;
