export type Settings = {
  collapsedDays: string[];
  truncateLongNames: boolean;
  turnLongNamesIntoInitialsAfter: number;
};

export const defaultSettings: Settings = {
  collapsedDays: [],
  truncateLongNames: true,
  turnLongNamesIntoInitialsAfter: 25,
};
