// src/types.ts
export interface Loc {
  lat: number;
  lon: number;
}

export interface ProviderInfo {
  v4: boolean;
  v6: boolean;
}

export interface CityInfo {
  name: string;
  loc: Loc;
  providers?: Record<string, ProviderInfo>;
}

export interface ProvinceInfo {
  name: string;
  loc: Loc;
  providers?: Record<string, ProviderInfo>;
  cities?: Record<string, CityInfo>;
}

export interface CountryInfo {
  name: string;
  loc: Loc;
  providers?: Record<string, ProviderInfo>;
  provinces?: Record<string, ProvinceInfo>;
  cities?: Record<string, CityInfo>;
}

export type DictionaryType = Record<string, CountryInfo>;

export interface IpInfoResult {
  ok: boolean;
  ip: string;
  provider: string;
  latitude?: number;
  longitude?: number;
}
