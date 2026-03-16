"use client";

import { useEffect, useState } from "react";
import {
  regions,
  provinces,
  cities,
  barangays,
  type Region,
  type Province,
  type City,
  type Barangay,
} from "select-philippines-address";
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

export type ChapterAddressValue = {
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  google_maps_url: string;
  landmark: string;
};

export type ChapterAddressLabels = {
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  gmaps: string;
  landmark: string;
};

type Props = {
  value: ChapterAddressValue;
  onChange: (value: ChapterAddressValue) => void;
  labels: ChapterAddressLabels;
};

export function ChapterAddressForm({ value, onChange, labels }: Props) {
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [cityList, setCityList] = useState<City[]>([]);
  const [barangayList, setBarangayList] = useState<Barangay[]>([]);

  // Track codes separately for cascading — codes drive dropdowns, names are stored
  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");

  const [showLandmark, setShowLandmark] = useState(!!value.landmark);

  // Load regions on mount
  useEffect(() => {
    regions().then((list) => {
      const cleanList = (list || []).map((r) => ({
        ...r,
        region_name: r.region_name.replace(/Region /g, ""),
      }));
      setRegionList(cleanList);
    });
  }, []);

  // When editing an existing chapter, pre-populate cascading dropdowns by name-matching
  useEffect(() => {
    if (!value.region || regionList.length === 0) return;
    const found = regionList.find((r) => r.region_name === value.region);
    if (found && found.region_code !== regionCode) {
      setRegionCode(found.region_code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.region, regionList]);

  useEffect(() => {
    if (!regionCode) {
      setProvinceList([]);
      setProvinceCode("");
      return;
    }
    provinces(regionCode).then((list) => {
      // Deduplicate by province_code and prettify names (especially for NCR)
      const cleanList = (list || [])
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex((t) => t.province_code === item.province_code),
        )
        .map((item) => ({
          ...item,
          province_name: item.province_name
            .replace(/Ncr, /g, "")
            .replace(/City Of Manila, /g, ""),
        }));

      setProvinceList(cleanList);

      if (value.province) {
        const found = cleanList.find((p) => p.province_name === value.province);
        if (found) setProvinceCode(found.province_code);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionCode]);

  useEffect(() => {
    if (!provinceCode) {
      setCityList([]);
      setCityCode("");
      return;
    }
    cities(provinceCode).then((list) => {
      const cleanList = (list || [])
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.city_code === item.city_code),
        )
        .map((item) => ({
          ...item,
          city_name: item.city_name.replace(/City Of /g, ""),
        }));

      setCityList(cleanList);
      if (value.city) {
        const found = cleanList.find((c) => c.city_name === value.city);
        if (found) setCityCode(found.city_code);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode]);

  useEffect(() => {
    if (!cityCode) {
      setBarangayList([]);
      return;
    }
    barangays(cityCode).then((list) => {
      const cleanList = (list || []).filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.brgy_code === item.brgy_code),
      );
      setBarangayList(cleanList);
    });
  }, [cityCode]);

  function handleRegionChange(code: string) {
    const found = regionList.find((r) => r.region_code === code);
    setRegionCode(code);
    setProvinceCode("");
    setCityCode("");
    onChange({
      ...value,
      region: found?.region_name ?? "",
      province: "",
      city: "",
      barangay: "",
    });
  }

  function handleProvinceChange(code: string) {
    const found = provinceList.find((p) => p.province_code === code);
    setProvinceCode(code);
    setCityCode("");
    onChange({
      ...value,
      province: found?.province_name ?? "",
      city: "",
      barangay: "",
    });
  }

  function handleCityChange(code: string) {
    const found = cityList.find((c) => c.city_code === code);
    setCityCode(code);
    onChange({ ...value, city: found?.city_name ?? "", barangay: "" });
  }

  function handleBarangayChange(code: string) {
    const found = barangayList.find((b) => b.brgy_code === code);
    onChange({ ...value, barangay: found?.brgy_name ?? "" });
  }

  function handleLandmarkToggle(checked: boolean) {
    setShowLandmark(checked);
    if (!checked) onChange({ ...value, landmark: "" });
  }

  const selectedRegionCode =
    regionCode ||
    regionList.find((r) => r.region_name === value.region)?.region_code ||
    "";
  const selectedProvinceCode =
    provinceCode ||
    provinceList.find((p) => p.province_name === value.province)
      ?.province_code ||
    "";
  const selectedCityCode =
    cityCode ||
    cityList.find((c) => c.city_name === value.city)?.city_code ||
    "";
  const selectedBarangayCode =
    barangayList.find((b) => b.brgy_name === value.barangay)?.brgy_code || "";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="ch-region">{labels.region}</Label>
          <Select value={selectedRegionCode} onValueChange={handleRegionChange}>
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
            value={selectedProvinceCode}
            onValueChange={handleProvinceChange}
            disabled={!regionCode && !selectedRegionCode}
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
            value={selectedCityCode}
            onValueChange={handleCityChange}
            disabled={!provinceCode && !selectedProvinceCode}
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
            value={selectedBarangayCode}
            onValueChange={handleBarangayChange}
            disabled={!cityCode && !selectedCityCode}
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
