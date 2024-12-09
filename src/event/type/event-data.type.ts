export type EventData = {
  archived: boolean;
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
