import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Trash } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationDialog from "../components/ConfirmationDialog";

function ContactUs() {
  const Base_Api = import.meta.env.VITE_BASE_API;
  const [data, setData] = useState([]);
   const [editId, setEditId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetchAllInquiriesLibraryn = async () => {
    try {
      const res = await axios.get(`${Base_Api}/api/inquiries`);
      console.log(res);

      if (res.data.success) setData(res.data.inquiries);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllInquiriesLibraryn();
  }, []);


  const columns = [
    {
      Header: "createdAt",
      accessor: "createdAt",
      sortable: true,
      Cell: ({ row }) => <span>{row.createdAt.split("T")[0]}</span>,
    },
    {
      Header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      Header: "email",
      accessor: "email",
      sortable: true,
    },
    {
      Header: "Query",
      accessor: "query",
      sortable: true,
    },
    {
      Header: "Amount",
      accessor: "amount",
      sortable: true,
    },
    {
      Header: "Action",
      accessor: "actions",
      sortable: false,
      Cell: ({ row }) => (
        <div className="flex gap-5 text-xl">
          <span
            className="cursor-pointer text-gray-600 hover:text-red-600 transition-colors"
            onClick={() => handleDeleteClick(row)}
            title="View Details"
          >
            <Trash size={24} />
          </span>
        </div>
      ),
    },
  ];
  const handleDeleteClick = (row) => {
    setEditId(row._id);
    setIsDialogOpen(true);
  };
  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`${Base_Api}/api/inquiries/${editId}`);
      console.log(res);
      
      if (res.data.success) {
        toast.success("Qurye deleted");
        fetchAllInquiriesLibraryn();
      }
    } catch (error) {
      toast.error("Error deleting");
        fetchAllInquiriesLibraryn();
    } finally {
      setIsDialogOpen(false);
      setEditId("");
    }
  };
  return (
    <div className="">
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Query"
        message="Are you sure you want to delete this Query? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDialogOpen(false)}
      />
      <div className="md:px-8 px-4 border-b border-slate-300 py-4  left-0 right-0 z-10 bg-slate-200">
        <div className="flex  items-center justify-between ">
          <div className="text-base">
            <h5 className="font-semibold">Enquiries </h5>
            <p className="text-sm">Manage your Enquiries</p>
          </div>
          <div>
            {/* <Btn bticon="ri-add-circle-line" btname="Add New" btclass="primary" btnclick={() => openModal({ title: "Add New vendor" })} /> */}
          </div>
        </div>
      </div>
      <div className="mt-10 px-8">
        <DataTable
          columns={columns}
          data={data || []}
          defaultSort={{ field: "_id", direction: "asc" }}
          pageSize={8}
          searchable={true}
        />
      </div>
    </div>
  );
}

export default ContactUs;
