"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import type { AddressValue, AddressLabels } from "@/lib/types";

import { useChapterAddress } from "@/hooks/use-chapter-address";

type Props = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  labels: AddressLabels;
};

export function ChapterAddressForm({ value, onChange, labels }: Props) {
  const {
    regionList,
    provinceList,
    cityList,
    barangayList,
    regionCode,
    provinceCode,
    cityCode,
    barangayCode,
    showLandmark,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    handleLandmarkToggle,
  } = useChapterAddress(value, onChange);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="ch-region">{labels.region}</Label>
          <Select value={regionCode} onValueChange={handleRegionChange}>
            <SelectTrigger id="ch-region">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regionList.map((r) => (
                <SelectItem key={r.region_code} value={r.region_code}>
                  {r.region_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Province */}
        <div className="space-y-2">
          <Label htmlFor="ch-province">{labels.province}</Label>
          <Select
            value={provinceCode}
            onValueChange={handleProvinceChange}
            disabled={!regionCode}
          >
            <SelectTrigger id="ch-province">
              <SelectValue
                placeholder={
                  provinceList.length
                    ? "Select Province"
                    : "Select Region First"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {provinceList.map((p) => (
                <SelectItem key={p.province_code} value={p.province_code}>
                  {p.province_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
        {/* City / Municipality */}
        <div className="space-y-2">
          <Label htmlFor="ch-city">{labels.city}</Label>
          <Select
            value={cityCode}
            onValueChange={handleCityChange}
            disabled={!provinceCode}
          >
            <SelectTrigger id="ch-city">
              <SelectValue
                placeholder={
                  cityList.length ? "Select City" : "Select Province First"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cityList.map((c) => (
                <SelectItem key={c.city_code} value={c.city_code}>
                  {c.city_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Barangay */}
        <div className="space-y-2">
          <Label htmlFor="ch-barangay">{labels.barangay}</Label>
          <Select
            value={barangayCode}
            onValueChange={handleBarangayChange}
            disabled={!cityCode}
          >
            <SelectTrigger id="ch-barangay">
              <SelectValue
                placeholder={
                  barangayList.length ? "Select Barangay" : "Select City First"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {barangayList.map((b) => (
                <SelectItem key={b.brgy_code} value={b.brgy_code}>
                  {b.brgy_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="ch-street">{labels.street}</Label>
        <Input
          id="ch-street"
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          placeholder={`Enter ${labels.street} (optional)`}
        />
      </div>

      {/* Address Link */}
      <div className="space-y-2">
        <Label htmlFor="ch-gmaps">{labels.gmaps}</Label>
        <Input
          id="ch-gmaps"
          type="url"
          value={value.google_maps_url}
          onChange={(e) =>
            onChange({ ...value, google_maps_url: e.target.value })
          }
          placeholder={`Enter ${labels.gmaps} (optional)`}
        />
      </div>

      {/* Landmark Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ch-landmark-toggle">{`Add ${labels.landmark}`}</Label>
          <Switch
            id="ch-landmark-toggle"
            checked={showLandmark}
            onCheckedChange={handleLandmarkToggle}
          />
        </div>
        {showLandmark && (
          <Input
            id="ch-landmark"
            value={value.landmark}
            onChange={(e) => onChange({ ...value, landmark: e.target.value })}
            placeholder={`Enter Nearby ${labels.landmark}`}
          />
        )}
      </div>
    </div>
  );
}
