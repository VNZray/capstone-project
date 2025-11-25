import React from "react";
import { Stack, Typography } from "@mui/joy";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

interface AddressContactProps {
  address?: string;
  contact?: string;
}

const AddressContact: React.FC<AddressContactProps> = ({ address, contact }) => {
  if (!address && !contact) return null;

  return (
    <>
      {address && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
          <PlaceRoundedIcon fontSize="small" />
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            {address}
          </Typography>
        </Stack>
      )}

      {contact && (
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
          <PhoneRoundedIcon fontSize="small" />
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            {contact}
          </Typography>
        </Stack>
      )}
    </>
  );
};

export default AddressContact;
