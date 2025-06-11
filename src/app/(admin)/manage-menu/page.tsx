'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table/index';
import { Modal } from '@/components/ui/modal';
import Switch from '@/components/form/switch/Switch';
import Select from '@/components/form/Select';
import { DeleteIcon, EditIcon } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Loading from '@/app/Loading';
import axios from 'axios';
import * as XLSX from 'xlsx';


import { MenuType } from "@/types/MenuType"

interface ImportData {
  name: string; price: number; category: string; isVeg: boolean; available: boolean
}


 interface RawExcelItem {
  Name: string;
  Price: string | number;
  Category: string;
  'Veg/Non-Veg': string;
  Available: string;
}


const MenuManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [menuItems, setMenuItems] = useState<MenuType[]>([]); // Adjust type as needed

  const fetchMenuItems = async () => {
    try {
      const res = await axios("/api/fetch-menu-items");
      if (!res.data.ok) {
        console.error("Failed to fetch menu items:", res.data.error);
        return;
      } else if (res.data.ok) {
        console.log("Menu items fetched successfully:", res.data.Menu);

        setMenuItems(res.data.Menu);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    // Exact match for specific words
    if (query === 'veg') return item?.isVeg === true;
    if (query === 'non-veg' || query === 'nonveg') return item?.isVeg === false;
    if (query === 'yes' || query === 'available') return item?.available === true;
    if (query === 'no' || query === 'unavailable') return item?.available === false;

    // Otherwise, do normal partial match
    return (
      item?.name.toLowerCase().includes(query) ||
      item?.price.toString().includes(query) ||
      item?.category.toLowerCase().includes(query)
    );
  });


  const tableHeader = ["Name", "Price", "Category", "Veg/Non-Veg", "Available", "Actions"]
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [disableSave, setDisableSave] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);



  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    isVeg: false,
    available: true,
  });


  const handleChange = (
    e: { name: string; value: string | boolean; }
  ) => {

    const { name, value } = e;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(e.name, " = ", e.value);
    console.log(formData);
    // }
  };


  const [error, setError] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableSave(true);
    setError('');
    const { name, price, category, } = formData;
    if (!name.trim() || !price || !category.trim()) {
      setError('Please fill all fields');
      setDisableSave(false);
      return;
    }
    try {
      const url = isEditing ? '/api/update-menu-item' : '/api/add-menu-item';
      const payload = isEditing
        ? { id: editItemId, ...formData }
        : formData;

      const res = await axios({
        method: isEditing ? 'PUT' : 'POST',
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.ok) {
        console.log('Success:', res.data.item);
        setError('');
        if (isEditing) {
          setMenuItems((prev) =>
            prev.map((item) =>
              item?._id === editItemId ? res.data.item : item
            )
          );
        } else {
          setMenuItems((prev) => [...prev, res.data.item]);
        }

        setFormData({
          name: '',
          price: '0',
          category: '',
          isVeg: false,
          available: true,
        });
        setIsModalOpen(false);
        setIsEditing(false);
        setEditItemId(null);
        setDisableSave(false);
      } else {
        setError(res.data.error || 'Server error');
        console.error('Server Error:', res.data.error.response.data.erro);
        setDisableSave(false);
      }
    } catch (err) {
       if (axios.isAxiosError(err)) {
    setError(err?.response?.data?.error || 'Server error');

    console.error('Request Failed:', err);
    setDisableSave(false);
  } else {
    console.error("Unknown error:", err);
  }
    }
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await axios.delete('/api/delete-menu-item', {
        data: { id },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.ok) {
        console.log('Item deleted:', res.data.message);
        setMenuItems((prev) => prev.filter((item) => item?._id !== id));
      } else {
        console.error('Delete failed:', res.data.error);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };


  const handleImport = async (data: ImportData[]) => {
    try {
      const res = await axios.post('/api/import-menu-items', {
        items: data,
      });

      if (res.data.ok) {
        console.log('Import successful:', res.data.message);
        // setMenuItems((prev) => [...prev, ...data]);
        fetchMenuItems(); // Refresh the menu items after import

      } else {
        console.error('Import failed:', res.data.error);
      }
    }
    catch (err) {
      console.error('Error importing data:', err);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    const formattedData = (jsonData as RawExcelItem[]).map((item) => ({
      name: item['Name'] || '',
      price:  parseFloat(String(item['Price'] ?? '0')),

      category: item['Category'] || '',
      isVeg: item['Veg/Non-Veg']?.toLowerCase() === 'veg',
      available: item['Available']?.toLowerCase() === 'yes',
    }));

    try {
      console.log('Formatted Data:', formattedData);
      await handleImport(formattedData);
      // const res = await axios('/api/fetch-menu-items');
      // if (res.data.ok) {
      //   alert('Menu items imported successfully');
      // } else {
      //   alert('Error: ' + res.data.error);
      // }
    } catch (err) {
      console.error('Import failed:', err);
    }
  };


  const deleteSelected = async (selectedIds: string[]) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await axios.delete('/api/delete-selected-menu-items', {
        data: { ids: selectedIds },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsLoading(true);
      if (res.data.ok) {
        console.log('Items deleted(selected):', res.data.message);
        setMenuItems(prev => prev.filter(i => !selectedIds.includes(i._id)));
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

      const idsInRange = filteredItems.slice(start, end + 1).map((item) => item._id);

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
      <PageBreadcrumb pageTitle="Menu Management" />
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

            {/* Right section: import + add item */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto no-padding">
                <input
                  type="file"
                  className="hidden"
                  id="fileUpload"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="fileUpload"
                  className="px-4 py-3 w-full sm:w-auto flex items-center justify-center cursor-pointer"
                >
                  Import
                </label>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setIsModalOpen(true)}
              >
                Add Item
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
                          const allIds = menuItems.map(item => item?._id);
                          setSelectedIds(e.target.checked ? allIds : []);
                        }} checked={selectedIds.length === menuItems.length} />
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
                          onChange={(e) => handleCheckboxChange(e, index, item._id)}
                        />
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">

                          {item?.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.price}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.category}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.isVeg ? "Veg" : "Non-Veg"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {item?.available == true ? (
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
                              onClick={() => {
                                setIsEditing(true);
                                setIsModalOpen(true);
                                setEditItemId(item?._id);
                                setFormData({
                                  name: item?.name,
                                  price: item?.price.toString(),
                                  category: item?.category,
                                  isVeg: item?.isVeg,
                                  available: item?.available,
                                });
                              }}
                            >
                              <EditIcon className="h-4 w-4 text-blue-500" />
                            </Button>

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



          {/* Modal for Add/Edit */}
          {isModalOpen && (
            <Modal onClose={() => {

              setIsModalOpen(false);


            }} isOpen={isModalOpen} title='Add Menu Item' className='pb-4 pt-4 px-6  max-w-[350px] ' showCloseButton={true} >
              <div className='mt-8'>
                <form onSubmit={handleFormSubmit}>
                  <div className="grid grid-cols-1 gap-4">
                    <Input name='name' placeholder="Name" type="text" defaultValue={formData.name} onChange={(e) => handleChange({ name: 'name', value: e.target.value })} />
                    <Input name='price' placeholder="Price" type="number" defaultValue={formData.price} step={0.01} onChange={(e) => handleChange({ name: 'price', value: e.target.value })} />
                    <Select
                      name='category'

                      placeholder="Select category"
                      options={[
                        { value: 'Starter', label: 'Starter' },
                        { value: 'Main Course', label: 'Main Course' },
                        { value: 'Drinks', label: 'Drinks' },
                        { value: 'Chinese', label: 'Chinese' },
                        { value: 'Dessert', label: 'Dessert' },
                      ]}
                      onChange={(e) => handleChange({ name: "category", value: e.target.value })} />
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked={formData.isVeg} label="Vegetarian"  onChange={(e) => handleChange({ name: "isVeg", value: e })} />
                      <Switch defaultChecked={formData.available} label="Available" onChange={(e) => handleChange({ name: "available", value: e })} />
                    </div>

                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="primary" onClick={() => handleFormSubmit} disabled={disableSave} >
                      {
                        isEditing ? 'Update Item' : 'Add Item'


                      }
                    </Button>
                  </div>
                  <p className='text-error-700 text-xs '>{error}</p>
                </form>
              </div>
            </Modal>

          )}
        </div>
      </div>
    </Suspense>
  );
};

export default MenuManagement;
