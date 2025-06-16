export interface BillType {
  _id: string;
  items: [
    {
      _id: string;
      name: string;
      price: number;
      quantity: number;
    }
  ];
  total: number;
  createdAt: Date;
  customerName:string;
  customerPhone:string;
  includeGST:boolean;
};
