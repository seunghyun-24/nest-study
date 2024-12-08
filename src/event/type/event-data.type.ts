export type EventData = {
  id: number;
  title: string;
  description: string;
  hostId: number;
  categoryId: number;
  clubId: number | null;
  eventCity: {
    cityId: number;
  }[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
