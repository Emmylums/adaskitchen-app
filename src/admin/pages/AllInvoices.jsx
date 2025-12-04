import React, { useState, useMemo } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import jollofImg from "../../assets/jollof2.jpg";
import { useNavigate } from 'react-router-dom';

export default function AllInvoices() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => {
  setIsSidebarOpen(prev => {
    const newState = !prev;    return newState;
    });
    };

    const data = [
      {id: "INV001", customer: {image: jollofImg, name: "Jolly Boy"}, createdDate: "15th March, 2025 10:30 AM", dueDate: "25th March, 2025 1:15 PM", amount: "$12.00", paymentStatus: "UNPAID", paymentMethod: "Bank Transfer"},
    ]

  const handleEdit = (row, index) => {
    navigate(`/admin/menu/edit/${index}`, { state: row });
  };

  const handleDelete = (row) => {
    if (window.confirm(`Delete ${row.name}?`)) {
      alert(`${row.name} deleted`);
    }
  };

  const headings = ['image', 'name', 'description', 'ingredients', 'price', 'quantity', 'Categories'];

  const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
  
    // Filter data by search
    const filteredData = useMemo(() => {
      if (!searchQuery) return data;
      return data.filter((item) =>
        headings.some((key) =>
          String(item[key]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [searchQuery, data, headings]);
  
    // Sort data
    const sortedData = useMemo(() => {
      if (!sortConfig.key) return filteredData;
      const sorted = [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
  
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    }, [filteredData, sortConfig]);
  
    // Pagination
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = sortedData.slice(startIndex, startIndex + rowsPerPage);
  
    // Handle sort toggle
    const handleSort = (key) => {
      setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    };
  
    // Handle rows per page change
    const handleRowsPerPageChange = (e) => {
      setRowsPerPage(parseInt(e.target.value));
      setCurrentPage(1);
    };


  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebar} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} activeLink="/admin/menu/add"/>
      <div className='md:flex md:justify-end'>
        <div className={`pt-32 pb-10 px-5 ${isSidebarOpen ? "md:w-[75%] lg:w-[80%]" : "md:w-full"} transition-all duration-500`}>
          <h2 className='text-left w-full text-2xl mb-3.5 font-semibold font-display2'>ALL INVOICES</h2>
          <div>
            <div className="w-full">
              {/* Search and Page Size */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <input
                  type="text"
                  placeholder="Search..."
                  className="border border-own-2 bg-black text0 rounded px-3 py-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Rows per page:</label>
                  <select
                    className="border border-own-2 bg-black rounded px-2 py-1"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                  >
                    {[5, 10, 25, 50, 100].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="border border-own-2">

                
                <thead>
                  <tr className="bg-own-2 text-black">
                    <th className="px-4 py-2 border-b truncate">ID</th>
                    <th className="px-4 py-2 border-b truncate">CUSTOMER</th>
                    <th className="px-4 py-2 border-b truncate">CREATED DATE</th>
                    <th className="px-4 py-2 border-b truncate">DUE DATE</th>
                    <th className="px-4 py-2 border-b truncate">AMOUNT</th>
                    <th className="px-4 py-2 border-b truncate">PAYMENT STATUS</th>
                    <th className="px-4 py-2 border-b truncate">PAYMENT METHOD</th>
                    {(handleEdit || handleDelete) && (
                      <th className="px-4 py-2 border-b text-center">ACTIONS</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-black">
                  {currentRows.length > 0 ? (
                    currentRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-own-1">
                        
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-bold font-display text-left">
                          {row.id}
                        </td>

                        {/* NAME */}
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-bold font-display text-left min-w-44">
                          <div className='flex justify-start items-center gap-5'>
                            <div className='flex justify-center rounded-full'>
                                <img src={row.customer.image} alt="Csutomer photo" className='w-10 h-10 rounded-full object-cover' />
                            </div>
                            <p className='text-nowrap'>{row.customer.name || "-"}</p>
                          </div>
                        </td>

                        {/* DESCRIPTION */}
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-display text-left max-w-xs truncate">
                          {row.createdDate || "-"}
                        </td>

                        {/* INGREDIENTS */}
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-display text-left max-w-xs truncate">
                          {row.dueDate || "-"}
                        </td>

                        {/* PRICE */}
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-display text-center whitespace-nowrap">
                          {row.amount || "-"}
                        </td>

                        {/* QUANTITY */}
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-display text-center whitespace-nowrap">
                          {row.paymentStatus || "-"}
                        </td>

                        {/* CATEGORY */}
                        <td className="px-4 py-3 border-b-2 border-own-2 text-own-2 font-display text-left">
                          {row.paymentMethod || "-"}
                        </td>

                        {/* ACTIONS */}
                        {(handleEdit || handleDelete) && (
                          <td className="px-4 py-3 border-b-2 text-center border-own-2">
                            <div className="flex justify-center gap-2">
                              {handleEdit && (
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="flex items-center justify-center w-9 h-9 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                  title="Edit"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                              )}
                              {handleDelete && (
                                <button
                                  onClick={() => handleDelete(row)}
                                  className="flex items-center justify-center w-9 h-9 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={headings.length + 1} className="text-center py-4 text-own-2">
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {sortedData.length > rowsPerPage && (
              <div className="flex justify-end mt-4 gap-2 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1 ? 'bg-own-2 text-black' : 'bg-black'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}