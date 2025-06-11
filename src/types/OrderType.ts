import { MenuType } from "./MenuType";

export interface OrderType {
   _id: string;
  createdAt: string;
  items:MenuType[];
}
