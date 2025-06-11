
"use client";

import { Suspense, useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard"; // assuming you're using shadcn/ui or TailAdmin equivalent
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// import { cn } from "@/"; // Tailwind merge helper
import axios from "axios";
import {  X } from "lucide-react"; // Optional: for 3-dot icon

import { useRouter } from "next/navigation";
import Loading from "@/app/Loading";

interface TableType {
  _id: string;
  tableNumber: number;
  status: "available" | "running";
}

export default function POSPage() {
  const [tables, setTables] = useState<TableType[]>([
  //   {
  //     _id:"Id19gdtttttgd2",
  //    tableNumber: 1,
  // status: "available"
  // },
  //   {
  //     _id:"Id19rthry4",
  //    tableNumber: 2,
  // status: "running"
  // },
  //  {
  //     _id:"Ifghtd196",
  //    tableNumber: 3,
  // status: "available"
  // },
  //   {
  //     _id:"Id65yhfg197",
  //    tableNumber: 4,
  // status: "running"
  // },
  //  {
  //     _id:"Idfdgtry198",
  //    tableNumber: 5,
  // status: "available"
  // },
  //   {
  //     _id:"Id1dfgd99",
  //    tableNumber: 6,
  // status: "running"
  // },
  //  {
  //     _id:"Id1675790",
  //    tableNumber: 7,
  // status: "available"
  // },
  //   {
  //     _id:"Id2323195",
  //    tableNumber: 8,
  // status: "running"
  // },

  
  ]);

const router= useRouter();

  const fetchTables = async () => {
    try {
      const res = await axios("/api/fetch-tables");
      
      setTables(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);


  const [isLoading, setIsLoading] = useState<boolean >(true);

  
  const addTable = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/add-table");
     if(!res.data.ok){
        console.error("Failed to add table:", res.data.error);
        return;
      }else if(res.data.ok){
        console.log("Table added successfully:", res.data.newTable);
      fetchTables(); 
      }
     setIsLoading(false);
    } catch (err) {
      console.error("Failed to add table:", err);
    }
  };

 const deleteTable = async (id: string) => {
  try {
     setIsLoading(true);
     const res = await fetch("/api/delete-table", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Optionally update local state
        setTables((prev) => prev.filter((table) => table._id !== id));
        setIsLoading(false);
    } else {
      console.error("Delete failed:", data.message);
      alert(data.message || "Failed to delete table");
    }
  } catch (error) {
    console.error("Error deleting table:", error);
  }
};

if (isLoading) {
  return(
   <Loading />
  )
}

  return (
       
         <Suspense fallback={<Loading  />}>
          
         <div>
      <PageBreadcrumb pageTitle="Tables" />
      <div className=" rounded-2xl border border-gray-200 bg-white px-3 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-10">
   { tables&&tables.length>0?( <div className="p-6 grid grid-cols-1 xsm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {tables.map((table) => (
        <div key={table._id} className="relative group" onClick={() => {
router.push(`/POS/${table.tableNumber}`) 
      }}>
  <ComponentCard
    className="cursor-pointer text-center mx-auto"
    title={`Table ${table.tableNumber}`}
  >
    <p className={`text-xs capitalize py-1 px-3 max-w-fit ${
      table.status === "running"
        ? "bg-red-500 text-red-50"
        : "bg-green-500 text-green-50"
      } rounded-md`}>
      {table.status}
    </p>

    {/* Menu button shown on hover */}
    <button
      className="absolute top-2 right-2 text-gray-500 hover:text-black hidden group-hover:block"
      onClick={(e) => {
        e.stopPropagation();
        deleteTable(table._id); // or open a popover
      }}
    >
       <X className="w-5 h-5" />
    </button>
  </ComponentCard>
</div>

))}
    </div>)
    :(
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No tables available. Please add a table.</p>
      </div>
    )
    }
      <button
  className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white px-5 pb-2.5 pt-1.5 rounded-full shadow-xl text-lg"
  onClick={() => {
    addTable()
  }}
  
>
 <p style={{fontSize:"15px" ,display:"flex", alignItems:"center"}}> <b style={{fontSize:"20px",marginTop:"5px"}} className="md:mr-2">+</b> <span  className="hidden md:block mt-1"> Add Table </span></p>
</button>
      </div>
    </div>
  </Suspense>
  );
}
