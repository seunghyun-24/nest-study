export type CreateEventData = {
  title: string;
  description: string;
  hostId: number;
  categoryId: number;
  clubId: number | null;
  cityIds: number[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
