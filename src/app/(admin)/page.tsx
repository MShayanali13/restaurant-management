// pages/admin/dashboard.tsx
"use client"


import React, { useEffect, useState } from "react";
import Loading from "../Loading";

type DishStat = { name: string; count: number; };

export default function AdminDashboard() {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalBills, setTotalBills] = useState<number | null>(null);
  const [bestDishes, setBestDishes] = useState<DishStat[]>([]);
const [isLoading,setIsLoading]=useState(false)

 useEffect(() => {
  async function fetchData() {
    setIsLoading(true);
    const res = await fetch("/api/overview");
    const json = await res.json();
    setTotalRevenue(json.totalRevenue);
    setTotalBills(json.totalBills);
    setBestDishes(json.bestItems);
    setIsLoading(false);
  }
  fetchData();
}, []);


  if (isLoading) return <Loading /> ;

  return (
     <div className="grid grid-cols-12 gap-4 md:gap-6">
       <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="p-4 bg-white shadow rounded">
        <h2 className="text-sm text-gray-500">Revenue Collected</h2>
          <p className="text-2xl font-bold">₹{totalRevenue}</p>
          </div>
       </div>

       <div className="col-span-12 xl:col-span-5">
            <div className="p-4 bg-white shadow rounded">
         <h2 className="text-sm text-gray-500">Total Bills / Orders</h2>
          <p className="text-2xl font-bold">{totalBills}</p>
          </div>
       </div>

       <div className="col-span-12">
        
            <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Best‑selling Dish</h2>
          {bestDishes.length > 0 ? (
            <p className="text-xl font-semibold">
              {bestDishes[0].name} ({bestDishes[0].count})
            </p>
          ) : (
            <p>No data</p>
          )}

          </div>
       </div>

       

     </div>
    // <div className="p-6 space-y-6">
    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //     <div className="p-4 bg-white shadow rounded">
          
    //     </div>
    //     <div className="p-4 bg-white shadow rounded">
          
    //     </div>
    //     <div className="p-4 bg-white shadow rounded">
         
    //     </div>
    //   </div>

    //   <div className="bg-white shadow rounded p-4">
       
    //   </div>
    // </div>
  );
}



// import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";

// export const metadata: Metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

// export default function Dashboard() {
//   return (
//     <div className="grid grid-cols-12 gap-4 md:gap-6">
//       <div className="col-span-12 space-y-6 xl:col-span-7">
//         <EcommerceMetrics />

//         <MonthlySalesChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <MonthlyTarget />
//       </div>

//       <div className="col-span-12">
//         <StatisticsChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <DemographicCard />
//       </div>

//       <div className="col-span-12 xl:col-span-7">
//         <RecentOrders />
//       </div>
//     </div>
//   );
// }


