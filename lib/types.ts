export interface RouteResult {
  path: string[];
  distance: number;
  time: number;
  price: number;
}

export interface BookingDetails {
  name: string;
  gender: string;
  age: number;
  source: string;
  destination: string;
  selectedTrain: any;
  route: RouteResult;
} 