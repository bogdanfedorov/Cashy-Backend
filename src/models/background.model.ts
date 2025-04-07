export enum BackgroundCardStatus {
  Applied,
  Owned,
  CanBePurchased,
  EventOnly,
}

export type Background = {
  id: string;
  name: string;
  status: BackgroundCardStatus;
  price?: number;
  backgroundImageName: string;
};
