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
import type { AddressValue } from "@/lib/types/types";

export function useChapterAddress(
  value: AddressValue,
  onChange: (value: AddressValue) => void,
) {
  // Lists fetched from the library
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [cityList, setCityList] = useState<City[]>([]);
  const [barangayList, setBarangayList] = useState<Barangay[]>([]);

  // Internal selection state (always use codes as keys for ShadCN Select)
  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");

  const [showLandmark, setShowLandmark] = useState(!!value.landmark);

  // 1. Initial Load: Regions
  useEffect(() => {
    regions().then((list) => {
      const cleanList = (list || []).map((r) => ({
        ...r,
        region_name: r.region_name.replace(/Region /g, ""),
      }));
      setRegionList(cleanList);
    });
  }, []);

  // 2. Cascade Level 1: Region -> Province
  // Also handles Edit Mode: Sync regionCode from value
  useEffect(() => {
    if (regionList.length === 0) return;

    // Use code first, fall back to name-matching for backward compatibility
    const initialCode = value.region_code || regionList.find(r => r.region_name === value.region)?.region_code;
    
    if (initialCode && initialCode !== regionCode) {
      setRegionCode(initialCode);
      return; // Wait for the next effect to fetch province list
    }

    if (!regionCode) {
      setProvinceList([]);
      setProvinceCode("");
      return;
    }

    provinces(regionCode).then((list) => {
      // Deduplicate and prettify (especially for NCR districts)
      const cleanList = (list || [])
        .filter((item, index, self) => index === self.findIndex((t) => t.province_code === item.province_code))
        .map((item) => ({
          ...item,
          province_name: item.province_name.replace(/Ncr, /g, "").replace(/City Of Manila, /g, ""),
        }));
      setProvinceList(cleanList);
    });
  }, [regionList, regionCode, value.region, value.region_code]);

  // 3. Cascade Level 2: Province -> City
  // Also handles Edit Mode: Sync provinceCode from value
  useEffect(() => {
    if (provinceList.length === 0) return;

    const initialCode = value.province_code || provinceList.find(p => p.province_name === value.province)?.province_code;
    
    if (initialCode && initialCode !== provinceCode) {
      setProvinceCode(initialCode);
      return;
    }

    if (!provinceCode) {
      setCityList([]);
      setCityCode("");
      return;
    }

    cities(provinceCode).then((list) => {
      const cleanList = (list || [])
        .filter((item, index, self) => index === self.findIndex((t) => t.city_code === item.city_code))
        .map((item) => ({
          ...item,
          city_name: item.city_name.replace(/City Of /g, ""),
        }));
      setCityList(cleanList);
    });
  }, [provinceList, provinceCode, value.province, value.province_code]);

  // 4. Cascade Level 3: City -> Barangay
  // Also handles Edit Mode: Sync cityCode from value
  useEffect(() => {
    if (cityList.length === 0) return;

    const initialCode = value.city_code || cityList.find(c => c.city_name === value.city)?.city_code;
    
    if (initialCode && initialCode !== cityCode) {
      setCityCode(initialCode);
      return;
    }

    if (!cityCode) {
      setBarangayList([]);
      setBarangayCode("");
      return;
    }

    barangays(cityCode).then((list) => {
      const cleanList = (list || [])
        .filter((item, index, self) => index === self.findIndex((t) => t.brgy_code === item.brgy_code));
      setBarangayList(cleanList);
    });
  }, [cityList, cityCode, value.city, value.city_code]);

  // 5. Cascade Level 4: Barangay
  // Sync barangayCode from value
  useEffect(() => {
    if (barangayList.length === 0) return;
    const initialCode = value.barangay_code || barangayList.find(b => b.brgy_name === value.barangay)?.brgy_code;
    if (initialCode && initialCode !== barangayCode) {
      setBarangayCode(initialCode);
    }
  }, [barangayList, barangayCode, value.barangay, value.barangay_code]);


  // Event Handlers
  function handleRegionChange(code: string) {
    const found = regionList.find((r) => r.region_code === code);
    setRegionCode(code);
    setProvinceCode(""); // Clear codes instantly
    setCityCode("");
    setBarangayCode("");
    
    onChange({
      ...value,
      region: found?.region_name ?? "",
      region_code: code,
      province: "",
      province_code: "",
      city: "",
      city_code: "",
      barangay: "",
      barangay_code: "",
    });
  }

  function handleProvinceChange(code: string) {
    const found = provinceList.find((p) => p.province_code === code);
    setProvinceCode(code);
    setCityCode("");
    setBarangayCode("");
    
    onChange({
      ...value,
      province: found?.province_name ?? "",
      province_code: code,
      city: "",
      city_code: "",
      barangay: "",
      barangay_code: "",
    });
  }

  function handleCityChange(code: string) {
    const found = cityList.find((c) => c.city_code === code);
    setCityCode(code);
    setBarangayCode("");
    
    onChange({
      ...value,
      city: found?.city_name ?? "",
      city_code: code,
      barangay: "",
      barangay_code: "",
    });
  }

  function handleBarangayChange(code: string) {
    const found = barangayList.find((b) => b.brgy_code === code);
    setBarangayCode(code);
    onChange({
      ...value,
      barangay: found?.brgy_name ?? "",
      barangay_code: code,
    });
  }

  function handleLandmarkToggle(checked: boolean) {
    setShowLandmark(checked);
    if (!checked) onChange({ ...value, landmark: "" });
  }

  function handleStreetChange(val: string) {
    onChange({ ...value, street: val });
  }

  function handleMapsUrlChange(val: string) {
    onChange({ ...value, google_maps_url: val });
  }

  function handleLandmarkChange(val: string) {
    onChange({ ...value, landmark: val });
  }

  return {
    // Dropdown Data
    regionList,
    provinceList,
    cityList,
    barangayList,
    
    // Selection State (use these for Select value prop)
    regionCode,
    provinceCode,
    cityCode,
    barangayCode,
    
    // UI Helpers
    showLandmark,
    
    // Handlers
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    handleLandmarkToggle,
    handleStreetChange,
    handleMapsUrlChange,
    handleLandmarkChange,
  };
}
