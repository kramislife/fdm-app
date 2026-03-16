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
import type { AddressValue } from "@/lib/types";

export function useChapterAddress(
  value: AddressValue,
  onChange: (value: AddressValue) => void,
) {
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
  }, [value.region, regionList, regionCode]);

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
  }, [regionCode, value.province]);

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
  }, [provinceCode, value.city]);

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

  return {
    regionList,
    provinceList,
    cityList,
    barangayList,
    regionCode,
    provinceCode,
    cityCode,
    selectedRegionCode,
    selectedProvinceCode,
    selectedCityCode,
    selectedBarangayCode,
    showLandmark,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    handleLandmarkToggle,
  };
}
