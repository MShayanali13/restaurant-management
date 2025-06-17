"use client";

import React, { Suspense, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Loading from "@/app/Loading";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { saveOrderToIndexedDB, deleteOrderFromIndexedDB } from "@/lib/indexedDB";
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


import { pdf } from "@react-pdf/renderer";
import BillDocument from "@/components/pos/BillDocument";


export default function POSPage() {
  const params = useParams();

  const tableNumber = params?.id || "0";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [orderItems, setOrderItems] = useState<MenuType[]>([]);

  const [menuItems, setMenuItems] = useState<MenuType[]>([]);
  const [isLoading, setIsLoading] = useState([true, true, false]);

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [includeGST, setIncludeGST] = useState(true)

  const router = useRouter()
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
      setIsLoading([false, isLoading[1], isLoading[2]]);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const loadOrder = async () => {
      if (!tableNumber) return;

      try {
        // Try fetching from server first

        const res = await axios({
          url: `/api/fetch-temp-order`,
          method: "POST",
          data: JSON.stringify({
            tableNumber
          })
        });
        const data = await res.data
        if (data.ok && data.message.items?.length > 0) {
          setOrderItems(data.message.items); // ✅ use latest 
          await saveOrderToIndexedDB(String(tableNumber), data.message.items); // sync local
          return;
        }
      } catch (e) {
        console.warn("[⚠️] Fetch from server failed, falling back to local", e);
      }

      // // If server failed, fall back to local
      // const localData = await getOrderFromIndexedDB(String(tableNumber));
      // if (localData?.items?.length > 0) {
      //   setOrderItems(localData.items);
      // } else {
      //   setOrderItems([]);
      // }

      setIsLoading([isLoading[0], false, isLoading[2]]);

    };

    loadOrder();
  }, [tableNumber]);


  
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

      // ✅ Use updatedItems directly (not stale orderItems)
      saveOrderDebounced(String(tableNumber), updatedItems);

      // ✅ No need to log stale orderItems
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

      saveOrderDebounced(String(tableNumber), updatedItems);
      return updatedItems;
    });




  };

  useEffect(() => {
    if (orderItems.length < 1) {
      axios.post("/api/update-table-status", {
        tableNumber,
        status: "available",
      });
    } else {
      axios.post("/api/update-table-status", {
        tableNumber,
        status: "running",
      });
    }
  }, [orderItems])

  const generateBillNumber = async () => {


    // 1. Fetch number of bills already created (for serial number)
    const res = await axios("/api/fetch-bills");
    const data = res.data
    if (data.count) {
      const serial = String(data.count + 1).padStart(4, "0"); // e.g., "007"
      console.log(serial)
      return `B-${serial}`;
    }

  };

  const handleOpenPDF = async (
    items: MenuType[],
    tableNumber: number,
    billNumber: string
  ) => {
    if (billNumber) {
      console.log(billNumber)
      const blob = await pdf(
        <BillDocument
          items={items}
          tableNumber={tableNumber}
          billNumber={billNumber}
      customerName={customerName}
customerPhone={customerPhone}

includeGST={includeGST}
        />
      ).toBlob();

      // Create a URL to the PDF Blob
      const blobUrl = URL.createObjectURL(blob);

      // Open the Blob URL directly in a new tab
      window.open(blobUrl, "_blank");
    }
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
      setIsLoading([isLoading[0], isLoading[1], true])
      await fetch("/api/save-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          tableNumber: tableNumber,
          customerName,
          customerPhone,
          includeGST
        }),
      });
      setIsLoading([isLoading[0], isLoading[1], false])
      await fetch(`/api/delete-temp-order`, {
        method: "DELETE",
        body: JSON.stringify({
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
      const bill = await generateBillNumber()
      if (bill) {
        handleOpenPDF(orderItems, Number(tableNumber), String(bill))
      }
      router.push("/POS");
    } catch (e) {
      console.error("Saving error", e);
    }
  };

  if (isLoading[0] && isLoading[1]) return <Loading />;

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
                const inOrder = orderItems?.find((o) => o._id === item._id);
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
            {/* <form> */}
              <div className="mb-2 dark:text-white mt-2 pt-3 border-t-2">
                <label className="block text-sm font-medium">Customer Name</label>
                <input
                  type="text"

                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border w-full px-2 py-1 text-sm rounded-2xl"
                />
              </div>
              <div className="mb-2 dark:text-white">
                <label className="block text-sm font-medium">
                  Phone
                  </label>
                <input

                  type="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="border w-full px-2 py-1 text-sm rounded-2xl"
                />
              </div>
              <div className="mb-2  dark:text-white flex items-center">
                <input
                  type="checkbox"
                  checked={includeGST}
                  onChange={(e) => setIncludeGST(e.target.checked)}
                  className="mr-2 rounded-2xl"
                />
                <label className="text-sm">Include GST (5%)</label>
                </div>
                {orderItems?.length > 0 && (
                  <>
                    {/* <PDFViewer style={{ width: "100%", height: "800px" }} showToolbar={false}>
     
  </PDFViewer> */}

                    <Button className="w-full mt-4" onClick={handleSaveBill}>
                      {isLoading[2] ? "Preparing..." : "Generate Bill"}
                    </Button>


                  </>


                )}
            {/* </form> */}
          </div>
        </div>
      </div>

    </Suspense>
  );
}
