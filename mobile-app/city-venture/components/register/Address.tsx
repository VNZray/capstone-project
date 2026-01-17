import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Dropdown from "@/components/Dropdown";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors } from "@/constants/color";
import axios from "axios";
import api from "@/services/api/api";
import { FontAwesome5 } from "@expo/vector-icons";
import Section from "@/components/Section";

interface AddressProps {
  data: {
    provinceId: number | null;
    municipalityId: number | null;
    barangayId: number | null;
    ethnicity: string;
    origin: string;
  };
  onUpdate: (data: any) => void;
}

export default function Address({ data, onUpdate }: AddressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [province, setProvince] = useState<{ id: number; province: string }[]>(
    [],
  );
  const [municipality, setMunicipality] = useState<
    { id: number; municipality: string }[]
  >([]);
  const [barangay, setBarangay] = useState<{ id: number; barangay: string }[]>(
    [],
  );

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
        `${api}/address/municipalities/${provinceId}`,
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
        `${api}/address/barangays/${municipalityId}`,
      );
      if (Array.isArray(response.data)) {
        setBarangay(response.data);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  useEffect(() => {
    fetchProvince();
  }, []);

  useEffect(() => {
    if (data.provinceId) {
      fetchMunicipality(data.provinceId);
    }
  }, [data.provinceId]);

  useEffect(() => {
    if (data.municipalityId) {
      fetchBarangay(data.municipalityId);
    }
  }, [data.municipalityId]);

  return (
    <View style={styles.container}>
      {/* Address Information Section */}
      <Section
        icon="map-marker-alt"
        title="Address Information"
        isDark={isDark}
      >
        <Dropdown
          label="Province"
          placeholder="Select your province"
          items={province.map((p) => ({ id: p.id, label: p.province }))}
          value={data.provinceId}
          onSelect={(item) => {
            const id = item?.id as number;
            onUpdate({
              provinceId: id,
              municipalityId: null,
              barangayId: null,
            });
            setMunicipality([]);
            setBarangay([]);
            if (id) fetchMunicipality(id);
          }}
          variant="outlined"
          elevation={2}
          clearable
          required
        />

        <Dropdown
          label="Municipality/City"
          placeholder={
            data.provinceId
              ? "Select your municipality"
              : "Select province first"
          }
          items={municipality.map((m) => ({ id: m.id, label: m.municipality }))}
          value={data.municipalityId}
          disabled={!data.provinceId}
          onSelect={(item) => {
            const id = item?.id as number;
            onUpdate({ municipalityId: id, barangayId: null });
            setBarangay([]);
            if (id) fetchBarangay(id);
          }}
          variant="outlined"
          elevation={2}
          clearable
          required
        />

        <Dropdown
          label="Barangay"
          placeholder={
            data.municipalityId
              ? "Select your barangay"
              : "Select municipality first"
          }
          items={barangay.map((b) => ({ id: b.id, label: b.barangay }))}
          value={data.barangayId}
          disabled={!data.municipalityId}
          onSelect={(item) => {
            const id = item?.id as number;
            onUpdate({ barangayId: id });
          }}
          variant="outlined"
          elevation={2}
          clearable
          required
        />
      </Section>

      {/* Demographics Section */}
      <Section icon="globe" title="Demographics" isDark={isDark}>
        <View>
          <ThemedText mb={8} type="label-medium" weight="semi-bold">
            I am a:{" "}
            <ThemedText type="label-small" style={{ color: colors.error }}>
              *
            </ThemedText>
          </ThemedText>
          <View style={styles.radioGroup}>
            {[
              { value: "Bicolano", description: "From Bicol Region" },
              { value: "Non-Bicolano", description: "From other regions" },
              { value: "Foreigner", description: "International visitor" },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.demographicOption,
                  {
                    backgroundColor: isDark ? "#1B2232" : "#F9F9F9",
                    borderColor:
                      data.ethnicity === type.value
                        ? colors.primary
                        : isDark
                          ? "#2A3142"
                          : "#E5E7EB",
                  },
                  data.ethnicity === type.value && styles.radioSelected,
                ]}
                onPress={() => onUpdate({ ethnicity: type.value })}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="label-medium"
                    weight="semi-bold"
                    style={{
                      color:
                        data.ethnicity === type.value
                          ? colors.primary
                          : undefined,
                    }}
                  >
                    {type.value}
                  </ThemedText>
                  <ThemedText
                    type="body-small"
                    style={{
                      marginTop: 2,
                      color: isDark ? "#8B92A6" : "#64748B",
                    }}
                  >
                    {type.description}
                  </ThemedText>
                </View>
                {data.ethnicity === type.value && (
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <ThemedText mb={8} type="label-medium" weight="semi-bold">
            Origin:{" "}
            <ThemedText type="label-small" style={{ color: colors.error }}>
              *
            </ThemedText>
          </ThemedText>
          <View style={styles.radioGroup}>
            {[
              { value: "Domestic", icon: "flag" },
              { value: "Local", icon: "home" },
              { value: "Overseas", icon: "plane" },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioButton,
                  {
                    backgroundColor: isDark ? "#1B2232" : "#F9F9F9",
                    borderColor:
                      data.origin === type.value
                        ? colors.primary
                        : isDark
                          ? "#2A3142"
                          : "#E5E7EB",
                  },
                  data.origin === type.value && styles.radioSelected,
                ]}
                onPress={() => onUpdate({ origin: type.value })}
              >
                <FontAwesome5
                  name={type.icon}
                  size={14}
                  color={
                    data.origin === type.value
                      ? colors.primary
                      : isDark
                        ? "#8B92A6"
                        : "#64748B"
                  }
                />
                <ThemedText
                  type="label-small"
                  style={[
                    { marginLeft: 6 },
                    data.origin === type.value && {
                      color: colors.primary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {type.value}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 40,
  },
  radioGroup: {
    gap: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
  },
  demographicOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  radioSelected: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
