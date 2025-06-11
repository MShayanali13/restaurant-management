"use client";

import React, { Suspense, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Loading from "@/app/Loading";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { saveOrderToIndexedDB, getOrderFromIndexedDB, deleteOrderFromIndexedDB } from "@/lib/indexedDB";
import { saveOrderDebounced } from "@/lib/orderSync";

import { MenuType } from "@/types/MenuType";

const categories = [
  { value: "Starter", label: "Starter" },
  { value: "Main Course", label: "Main Course" },
  { value: "Drinks", label: "Drinks" },
  { value: "Chinese", label: "Chinese" },
];

const vegOptions = [
  { value: "Veg", label: "Veg" },
  { value: "Non-Veg", label: "Non-Veg" },
];


import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPDF from "@/components/pos/BillDocument";


export default function POSPage() {
  const params = useParams();
  const tableNumber = params?.id || "0";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [orderItems, setOrderItems] = useState<MenuType[]>([]);

  const [menuItems, setMenuItems] = useState<MenuType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router=useRouter()

  const fetchMenuItems = async () => {
    try {
      const res = await axios("/api/fetch-menu-items");
      if (res.data.ok) {
        setMenuItems(res.data.Menu);
      } else {
        console.error("Failed to fetch menu items:", res.data.error);
      }
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchTempOrder = async () => {
    if (!tableNumber) return;

    const localOrder = await getOrderFromIndexedDB(String(tableNumber));
    if (localOrder?.items) {
      setOrderItems(localOrder.items);
    }

    try {
      const res = await axios.get(`/api/fetch-temp-order?tableNumber=${tableNumber}`);
      if (res.data.ok && res.data.message.items?.length > 0) {
        setOrderItems(res.data.message.items);
        saveOrderToIndexedDB(String(tableNumber), res.data.message.items);
      }
    } catch (error) {
      console.error("Error fetching from server:", error);
    }
  };

  useEffect(() => {
    fetchTempOrder();
  }, [fetchTempOrder]);

  useEffect(() => {
    const syncOnReconnect = () => {
      console.log("[🌐] Back online. Resyncing...");
      if (orderItems.length > 0) {
        console.log(tableNumber, orderItems)
        saveOrderDebounced(String(tableNumber), orderItems);
      }
    };

    window.addEventListener("online", syncOnReconnect);
    return () => window.removeEventListener("online", syncOnReconnect);
  }, [orderItems, tableNumber]);


  const handleAdd = (item: MenuType) => {
    setOrderItems((prev) => {
      const updatedItems = prev.some((i) => i._id === item._id)
        ? prev.map((i) =>
          i._id === item._id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
        )
        : [...prev, { ...item, quantity: 1 }];
      console.log(tableNumber, orderItems)
      saveOrderDebounced(String(tableNumber), updatedItems); // IndexedDB + debounce sync

        axios.post("/api/update-table-status", {
      tableNumber,
      status: "running",
    });

      // MongoDB temp save
      return updatedItems;
    });
  };
  const handleRemove = (item: MenuType) => {
    setOrderItems((prev) => {
      const updatedItems = prev
        .map((i) =>
          i._id === item._id ? { ...i, quantity: (i.quantity || 0) - 1 } : i
        )
        .filter((i) => (i.quantity || 0) > 0);
      console.log(tableNumber, orderItems)
      saveOrderDebounced(String(tableNumber), updatedItems);

      return updatedItems;
    });
  };


  const filteredItems = menuItems.filter(
    (item) =>
      (selectedCategory === "" || item.category === selectedCategory) &&
      (selectedType === "" || (item.isVeg ? "Veg" : "Non-Veg") === selectedType) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );
  const handleSaveBill = async () => {
    // Save to DB
    try {
      await fetch("/api/save-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          tableNumber: tableNumber,
        }),
      });

       await fetch(`/api/delete-temp-order`, {
      method: "DELETE",
      body:JSON.stringify({
        tableNumber
      })
    });



 // ✅ Mark table as available
    await axios.post("/api/update-table-status", {
      tableNumber,
      status: "available",
    });


    // ✅ Clear IndexedDB
    await deleteOrderFromIndexedDB(String(tableNumber));


    setOrderItems([]);


    router.push("/POS");
    } catch (e) {
      console.error("Saving error", e);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-4">
        <PageBreadcrumb pageTitle="POS" />
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Panel */}
          <div className="lg:w-3/4 rounded-2xl border border-gray-200 bg-white px-3 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-10">
            <div className="flex flex-wrap gap-2">
              {/* Category Select */}
              <div className="relative sm:max-w-[230px] w-full min-w-[200px]">
                <Select
                  placeholder="-- Select Category --"
                  options={categories}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Veg/Non-Veg Select */}
              <div className="relative sm:max-w-[230px] w-full min-w-[200px]">
                <Select
                  placeholder="-- Select Type --"
                  options={vegOptions}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                {selectedType && (
                  <button
                    onClick={() => setSelectedType("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Search Input */}
              <div className="relative sm:max-w-[230px] w-full min-w-[200px]">
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filtered Menu Items */}
            <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {filteredItems.map((item) => {
                const inOrder = orderItems.find((o) => o._id === item._id);
                return (
                  <div key={item._id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.category} • {item.isVeg ? "Veg" : "Non-Veg"} • ₹{item.price}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="square-button" size="sm" onClick={() => handleRemove(item)}>-</Button>
                      <span className="dark:text-white">{inOrder?.quantity || 0}</span>
                      <Button variant="outline" className="square-button" size="sm" onClick={() => handleAdd(item)}>+</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Current Order */}
          <div className="lg:w-3/12 w-full rounded-2xl border border-gray-200 bg-white px-3 py-5 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between xl:px-8 xl:py-10">
            <div className="flex-1 space-y-4 overflow-y-auto dark:text-white">
              <h2 className="text-xl font-bold">Your Order</h2>
              {orderItems.length === 0 ? (
                <p className="text-muted">No items selected.</p>
              ) : (
                <ul className="space-y-4">
                  {orderItems.map((item) => (
                    <li key={item._id} className="flex justify-between">
                      <div>
                        <div>{item.name} x {item.quantity}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.category} • {item.isVeg ? "Veg" : "Non-Veg"} • ₹{item.price}
                        </div>
                      </div>
                      <div>₹{item.price * (item.quantity ?? 1)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* <Button onClick={handleSaveBill} className="w-full mt-4">Generate Bill</Button> */}
            {orderItems.length > 0 && (

              <PDFDownloadLink
                document={<BillPDF items={orderItems} tableNumber={parseInt(Array.isArray(tableNumber) ? tableNumber[0] : tableNumber)}
      billNumber={"D23-1542"} />}
                fileName={`Bill_Table_${tableNumber}.pdf`}
              >
                <Button className="w-full mt-4" onClick={handleSaveBill}>
                  Download Bill  </Button>

              </PDFDownloadLink>

            )}

          </div>
        </div>
      </div>

    </Suspense>
  );
}
