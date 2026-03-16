declare module "select-philippines-address" {
  export interface Region {
    region_code: string;
    region_name: string;
    region_reg_code: string;
    psgc_code: string;
  }

  export interface Province {
    province_code: string;
    province_name: string;
    region_code: string;
    psgc_code: string;
  }

  export interface City {
    city_code: string;
    city_name: string;
    province_code: string;
    region_desc: string;
    psgc_code: string;
  }

  export interface Barangay {
    brgy_code: string;
    brgy_name: string;
    province_code: string;
    region_code: string;
    city_code: string;
  }

  export function regions(): Promise<Region[]>;
  export function provinces(regionCode: string): Promise<Province[]>;
  export function cities(provinceCode: string): Promise<City[]>;
  export function barangays(cityCode: string): Promise<Barangay[]>;
}
