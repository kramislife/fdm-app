"use client";

import { useChapterAddress } from "@/hooks/use-chapter-address";
import type { AddressLabels, AddressValue } from "@/lib/types";
import { FormInput, FormSelect } from "@/components/shared/form-fields";

interface ChapterAddressFormProps {
  labels: AddressLabels;
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

export function ChapterAddressForm({
  labels,
  value,
  onChange,
}: ChapterAddressFormProps) {
  const {
    regionList,
    provinceList,
    cityList,
    barangayList,
    regionCode,
    provinceCode,
    cityCode,
    barangayCode,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    handleStreetChange,
    handleMapsUrlChange,
    handleLandmarkChange,
  } = useChapterAddress(value, onChange);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
        {/* Region */}
        <FormSelect
          label={labels.region}
          id="ch-region"
          value={regionCode}
          onValueChange={handleRegionChange}
          options={regionList.map((r) => ({
            value: r.region_code,
            label: r.region_name,
          }))}
          required
        />

        {/* Province */}
        <FormSelect
          label={labels.province}
          id="ch-province"
          value={provinceCode}
          onValueChange={handleProvinceChange}
          placeholder={
            provinceList.length ? "Select province" : "Select region first"
          }
          options={provinceList.map((p) => ({
            value: p.province_code,
            label: p.province_name,
          }))}
          disabled={!provinceList.length}
          required
        />

        {/* City */}
        <FormSelect
          label={labels.city}
          id="ch-city"
          value={cityCode}
          onValueChange={handleCityChange}
          placeholder={
            cityList.length ? "Select city" : "Select province first"
          }
          options={cityList.map((c) => ({
            value: c.city_code,
            label: c.city_name,
          }))}
          disabled={!provinceCode}
          required
        />

        {/* Barangay */}
        <FormSelect
          label={labels.barangay}
          id="ch-barangay"
          value={barangayCode}
          onValueChange={handleBarangayChange}
          placeholder={
            barangayList.length ? "Select barangay" : "Select city first"
          }
          options={barangayList.map((b) => ({
            value: b.brgy_code,
            label: b.brgy_name,
          }))}
          disabled={!cityCode}
          required
        />
      </div>

      <div className="space-y-5">
        <FormInput
          label={labels.street}
          id="ch-street"
          value={value.street}
          onChange={(e) => handleStreetChange(e.target.value)}
          optional
        />

        <FormInput
          label={labels.gmaps}
          id="ch-gmaps"
          value={value.google_maps_url}
          onChange={(e) => handleMapsUrlChange(e.target.value)}
          optional
        />

        <FormInput
          label={labels.landmark}
          id="ch-landmark"
          value={value.landmark}
          onChange={(e) => handleLandmarkChange(e.target.value)}
          optional
        />
      </div>
    </div>
  );
}
