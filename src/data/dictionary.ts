export interface Dict {
  provinces: Record<string, string>;
  cities: Record<string, Record<string, string>>;
  providers: Record<string, string>;
}

export const dictionary: Dict = {
  provinces: {
    xx: "Xiangxiang Province",
    yy: "Yunnan Province",
  },
  cities: {
    xx: {
      "aaaa": "Alpha City",
      "bbbb": "Beta City",
    },
    yy: {
      "cccc": "Capital City",
    },
    // …other provinces
  },
  providers: {
    ct: "China Telecom",
    cu: "China Unicom",
    cm: "China Mobile",
    // …add more provider codes & names
  },
};
