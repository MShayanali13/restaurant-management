'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table/index';

import { DeleteIcon } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Loading from '@/app/Loading';
import axios from 'axios';


import { BillType } from '@/types/BillType';


const Bills = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [bills, setBills] = useState<BillType[]>([]); // Adjust type as needed

  const fetchBills = async () => {
    try {
       const res = await axios("/api/fetch-bills");
    const data = res.data
      if (!data.ok) {
        console.error("Failed to fetch bills:", data.error);
        return;
      } else if (data.ok) {
        console.log("bills fetched successfully:", data.bills);

        setBills(data.bills);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredItems = bills.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    // // Exact match for specific words
    // if (query === 'veg') return item?.isVeg === true;
    // if (query === 'non-veg' || query === 'nonveg') return item?.isVeg === false;
    // if (query === 'yes' || query === 'available') return item?.available === true;
    let ingst=null
    if (query === 'no') {
        ingst= "no";
    }else if(query==='yes'){
        ingst='yes'
    }


    // Otherwise, do normal partial match
    return (
      item?.customerName.toLowerCase().includes(query) ||
      item?.customerPhone.toString().includes(query)||
         ingst&&ingst.toLowerCase().includes(query)
         
         
    );
  });


  const tableHeader = ["Total","Date","Customer Name","Customer Phone","Includes GST"]
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await axios.delete('/api/delete-bills', {
        data: { id },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.ok) {
        console.log('Item deleted:', res.data.message);
        setBills((prev) => prev.filter((item) => item?._id !== id));
      } else {
        console.error('Delete failed:', res.data.error);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };


  const deleteSelected = async (selectedIds: string[]) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await axios.delete('/api/delete-selected-bills', {
        data: { ids: selectedIds },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsLoading(true);
      if (res.data.ok) {
        console.log('Items deleted(selected):', res.data.message);
        setBills(prev => prev.filter(i => !selectedIds.includes(i._id)));
      } else {
        console.error('Delete failed:', res.data.error);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
    setSelectedIds([]);
  };
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    itemId: string
  ) => {
    const checked = e.target.checked;
    const isShift = (e.nativeEvent as MouseEvent).shiftKey;

    if (isShift && lastSelectedIndex !== null) {
      const start = Math.min(index, lastSelectedIndex);
      const end = Math.max(index, lastSelectedIndex);

      const idsInRange = filteredItems.slice(start, end + 1).map((item) => item?._id);

      setSelectedIds((prevSelected) => {
        const newSelected = checked
          ? Array.from(new Set([...prevSelected, ...idsInRange]))
          : prevSelected.filter((id) => !idsInRange.includes(id));
        return newSelected;
      });
    } else {
      setSelectedIds((prevSelected) =>
        checked
          ? [...prevSelected, itemId]
          : prevSelected.filter((id) => id !== itemId)
      );
      setLastSelectedIndex(index);
    }
  };

  if (isLoading) {
    return (

      <Loading />
    );
  }


  return (
    <Suspense fallback={<Loading />}>
      <PageBreadcrumb pageTitle="Bills" />
      <div className=" rounded-2xl border border-gray-200 bg-white px-3 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-10">
        <div className="p-6">
          {/* Page Header */}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            {/* Left section: search + delete */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Search menu items..."
                defaultValue={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />

              <Button
                onClick={() => deleteSelected(selectedIds)}
                disabled={selectedIds.length === 0}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </div>

          
          </div>

       

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className=" overflow-x-auto">

              {filteredItems.length > 0 ?
                (<Table className='max-w-full'>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell className="px-5 py-3 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        <input type="checkbox" multiple onChange={(e) => {
                          const allIds = bills.map(item => item?._id);
                          setSelectedIds(e.target.checked ? allIds : []);
                        }} checked={selectedIds.length === bills.length} />
                      </TableCell>
                      {
                        tableHeader.map((header, index) => (
                          <TableCell
                            key={index}
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            {header}
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {filteredItems.map((item, index) => (
                      <TableRow key={item?._id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">      <input
                          type="checkbox"
                          checked={selectedIds.includes(item?._id)}
                          onChange={(e) => handleCheckboxChange(e, index, item?._id)}
                        />
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">

                          {item?.total}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.customerName}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.customerPhone}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {item?.includeGST == true ? (
                            <span className="py-0.5 px-2 rounded-lg bg-green-500 text-white">Yes</span>) :
                            (
                              <span className='py-0.5 px-2 rounded-lg bg-red-500 text-white'>No</span>
                            )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          <div className="flex space-x-2">

                        

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item?._id)}
                            >
                              <DeleteIcon className="h-4 w-4 text-red-500" />
                            </Button>

                          </div>

                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>) :
                (
                  <h2 className="text-center py-3 text-gray-600">No Menu item?. Please add one.</h2>
                )}

            </div>
          </div>



                  </div>
      </div>
    </Suspense>
  );
};

export default Bills;
