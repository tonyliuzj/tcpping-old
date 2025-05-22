// src/data/dictionary.ts

// China: shared providers for all provinces/cities.
// Others: providers are specific to each city.

export interface ChinaDict {
  provinces: Record<string, string>;
  cities: Record<string, Record<string, string>>; // provinceCode -> { cityCode: cityName }
  providers: Record<string, string>; // same for all
}

export interface CityProviders {
  [cityCode: string]: {
    name: string;
    providers: Record<string, string>;
  };
}

export interface CountryDict {
  cities: CityProviders;
}

export type Dict = {
  CN: ChinaDict;
  [countryCode: string]: CountryDict | ChinaDict;
};

export const dictionary: Dict = {
  CN: {
    provinces: {
      bj: "Beijing",
      yy: "Yunnan Province",
      // ...add more provinces
    },
    cities: {
      bj: {
        aaaa: "Alpha City",
        bbbb: "Beta City",
        // ...more cities
      },
      yy: {
        cccc: "Capital City",
        // ...more cities
      },
      // ...more provinces
    },
    providers: {
      ct: "China Telecom",
      cu: "China Unicom",
      cm: "China Mobile",
      // ...more if needed
    },
  },
  US: {
    cities: {
      nyc: {
        name: "New York City",
        providers: {
          vz: "Verizon",
          att: "AT&T",
        },
      },
      sf: {
        name: "San Francisco",
        providers: {
          att: "AT&T",
          tm: "T-Mobile",
        },
      },
      la: {
        name: "Los Angeles",
        providers: {
          vz: "Verizon",
        },
      },
      // ...more cities
    },
  },
  DE: {
    cities: {
      ber: {
        name: "Berlin",
        providers: {
          dt: "Deutsche Telekom",
          vf: "Vodafone",
        },
      },
      muc: {
        name: "Munich",
        providers: {
          vf: "Vodafone",
        },
      },
      // ...more cities
    },
  },
  // ...add more countries as needed
};
