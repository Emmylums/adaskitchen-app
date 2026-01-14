import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faDollarSign, 
  faEdit, 
  faPlus, 
  faPrint, 
  faSearch, 
  faShoppingCart, 
  faStar, 
  faTimes, 
  faTrash, 
  faUpload, 
  faUser, 
  faUtensils,
  faSpinner,
  faEye,
  faFileInvoice,
  faDownload,
  faCalendarAlt,
  faFilePdf,
  faCheckCircle,
  faExclamationCircle,
  faClock,
  faEnvelope,
  faShare,
  faCalculator,
  faFilter,
  faChartLine,
  faCopy,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Invoices() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 1);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("Invoices");
  
  // Firebase data states
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Mock user data
  const userData = {
    name: "Ada Johnson",
    email: "ada.johnson@email.com",
    position: "Manager",
    phone: "+234 912 345 6789",
    joinDate: "January 2024",
    lastLogin: "2024-01-15 14:30",
    loginLocation: "Lagos, Nigeria",
    walletBalance: 12500
  };

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    orderId: "",
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: "",
    paymentInstructions: "Payment due within 7 days. Late payments subject to 5% fee.",
    status: "pending", // pending, paid, overdue, cancelled
    paymentMethod: "",
    paymentDate: "",
    referenceNumber: ""
  });

  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch data from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices
      const invoicesQuery = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
      const invoicesSnapshot = await getDocs(invoicesQuery);
      const invoicesList = invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        issueDate: doc.data().issueDate?.toDate ? doc.data().issueDate.toDate() : null,
        dueDate: doc.data().dueDate?.toDate ? doc.data().dueDate.toDate() : null,
        paymentDate: doc.data().paymentDate?.toDate ? doc.data().paymentDate.toDate() : null,
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
      setInvoices(invoicesList);

      // Fetch orders for invoice creation
      const ordersQuery = query(collection(db, "orders"), where("paymentStatus", "==", "paid"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList);

      // Fetch customers
      const customersQuery = query(collection(db, "customers"));
      const customersSnapshot = await getDocs(customersQuery);
      const customersList = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${random.toString().padStart(4, '0')}`;
  };

  // Create invoice from order
  const createInvoiceFromOrder = (order) => {
    const invoiceNumber = generateInvoiceNumber();
    
    setInvoiceForm({
      orderId: order.id,
      customerId: order.customerId || "",
      customerName: order.customerName || "",
      customerEmail: order.customerEmail || "",
      customerPhone: order.customerPhone || "",
      invoiceNumber: invoiceNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: order.items || [],
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total || 0,
      notes: order.notes || "",
      paymentInstructions: "Payment due within 7 days. Late payments subject to 5% fee.",
      status: "pending",
      paymentMethod: order.paymentMethod || "",
      paymentDate: "",
      referenceNumber: ""
    });
    
    setShowInvoiceModal(true);
  };

  // Handle invoice submission
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const invoiceData = {
        ...invoiceForm,
        subtotal: parseFloat(invoiceForm.subtotal) || 0,
        tax: parseFloat(invoiceForm.tax) || 0,
        discount: parseFloat(invoiceForm.discount) || 0,
        total: parseFloat(invoiceForm.total) || 0,
        issueDate: Timestamp.fromDate(new Date(invoiceForm.issueDate)),
        dueDate: Timestamp.fromDate(new Date(invoiceForm.dueDate)),
        paymentDate: invoiceForm.paymentDate ? Timestamp.fromDate(new Date(invoiceForm.paymentDate)) : null,
        createdAt: editingInvoice ? invoiceForm.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userData.name
      };

      if (editingInvoice) {
        // Update existing invoice
        await updateDoc(doc(db, "invoices", editingInvoice.id), invoiceData);
      } else {
        // Add new invoice
        await addDoc(collection(db, "invoices"), invoiceData);
      }

      // Reset form and close modal
      resetInvoiceForm();
      setShowInvoiceModal(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  // Handle edit invoice
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceForm({
      orderId: invoice.orderId || "",
      customerId: invoice.customerId || "",
      customerName: invoice.customerName || "",
      customerEmail: invoice.customerEmail || "",
      customerPhone: invoice.customerPhone || "",
      invoiceNumber: invoice.invoiceNumber || generateInvoiceNumber(),
      issueDate: invoice.issueDate ? invoice.issueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      discount: invoice.discount || 0,
      total: invoice.total || 0,
      notes: invoice.notes || "",
      paymentInstructions: invoice.paymentInstructions || "Payment due within 7 days. Late payments subject to 5% fee.",
      status: invoice.status || "pending",
      paymentMethod: invoice.paymentMethod || "",
      paymentDate: invoice.paymentDate ? invoice.paymentDate.toISOString().split('T')[0] : "",
      referenceNumber: invoice.referenceNumber || "",
      createdAt: invoice.createdAt
    });
    setShowInvoiceModal(true);
  };

  // Handle view invoice details
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetailsModal(true);
  };

  // Handle delete invoice
  const handleDeleteInvoice = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteDoc(doc(db, "invoices", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice. Please try again.");
      }
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId, newStatus, paymentData = {}) => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'paid' && paymentData) {
        updateData.paymentMethod = paymentData.paymentMethod;
        updateData.paymentDate = Timestamp.fromDate(new Date());
        updateData.referenceNumber = paymentData.referenceNumber;
      }

      await updateDoc(doc(db, "invoices", invoiceId), updateData);
      
      // Also update the corresponding order if it exists
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice?.orderId) {
        await updateDoc(doc(db, "orders", invoice.orderId), {
          paymentStatus: newStatus === 'paid' ? 'paid' : 'pending',
          updatedAt: serverTimestamp()
        });
      }

      fetchData();
      
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({
          ...selectedInvoice,
          ...updateData
        });
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      alert("Failed to update invoice status. Please try again.");
    }
  };

  // Generate text invoice
  const generateTextInvoice = (invoice) => {
    setGenerating(true);
    
    try {
      let invoiceText = `AFRIKITCH RESTAURANT\n`;
      invoiceText += `========================\n`;
      invoiceText += `123 Restaurant Street, Lagos, Nigeria\n`;
      invoiceText += `Phone: +234 123 456 7890 | Email: info@afrikitch.com\n\n`;
      invoiceText += `INVOICE\n`;
      invoiceText += `========================\n`;
      invoiceText += `Invoice #: ${invoice.invoiceNumber}\n`;
      invoiceText += `Issue Date: ${invoice.issueDate?.toLocaleDateString() || new Date().toLocaleDateString()}\n`;
      invoiceText += `Due Date: ${invoice.dueDate?.toLocaleDateString() || 'N/A'}\n`;
      invoiceText += `Status: ${invoice.status.toUpperCase()}\n\n`;
      invoiceText += `Bill To:\n`;
      invoiceText += `  ${invoice.customerName}\n`;
      if (invoice.customerEmail) invoiceText += `  ${invoice.customerEmail}\n`;
      if (invoice.customerPhone) invoiceText += `  ${invoice.customerPhone}\n\n`;
      invoiceText += `Items:\n`;
      invoiceText += `========================\n`;
      
      invoice.items?.forEach((item, index) => {
        invoiceText += `${index + 1}. ${item.name}\n`;
        invoiceText += `   Quantity: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}\n`;
      });
      
      invoiceText += `\nSummary:\n`;
      invoiceText += `========================\n`;
      invoiceText += `Subtotal: ${formatCurrency(invoice.subtotal)}\n`;
      if (invoice.tax > 0) invoiceText += `Tax (7.5%): ${formatCurrency(invoice.tax)}\n`;
      if (invoice.discount > 0) invoiceText += `Discount: -${formatCurrency(invoice.discount)}\n`;
      invoiceText += `Total: ${formatCurrency(invoice.total)}\n\n`;
      
      if (invoice.notes) {
        invoiceText += `Notes:\n${invoice.notes}\n\n`;
      }
      
      invoiceText += `Payment Instructions:\n`;
      invoiceText += invoice.paymentInstructions || "Payment due within 7 days. Late payments subject to 5% fee.";
      invoiceText += `\n\nThank you for your business!\n`;
      invoiceText += `This is a computer-generated invoice.\n`;
      
      // Create a blob and download
      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Print invoice
  const printInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintModal(true);
  };

  // Share invoice via email/text
  const shareInvoice = async (invoice) => {
    try {
      const invoiceText = `Invoice ${invoice.invoiceNumber} for ${invoice.customerName}\nAmount: ₦${invoice.total?.toLocaleString()}\nDue: ${invoice.dueDate?.toLocaleDateString() || 'N/A'}\nStatus: ${invoice.status}`;
      
      // Try using Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: invoiceText,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(invoiceText);
        alert("Invoice details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing invoice:", error);
      // If clipboard fails, show the text for manual copy
      const invoiceText = `Invoice ${invoice.invoiceNumber} for ${invoice.customerName}\nAmount: ₦${invoice.total?.toLocaleString()}\nDue: ${invoice.dueDate?.toLocaleDateString() || 'N/A'}\nStatus: ${invoice.status}`;
      alert(`Copy this invoice information:\n\n${invoiceText}`);
    }
  };

  // Reset invoice form
  const resetInvoiceForm = () => {
    setInvoiceForm({
      orderId: "",
      customerId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: "",
      paymentInstructions: "Payment due within 7 days. Late payments subject to 5% fee.",
      status: "pending",
      paymentMethod: "",
      paymentDate: "",
      referenceNumber: ""
    });
    setEditingInvoice(null);
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && isToday(invoice.issueDate)) ||
      (dateFilter === "week" && isThisWeek(invoice.issueDate)) ||
      (dateFilter === "month" && isThisMonth(invoice.issueDate)) ||
      (dateFilter === "overdue" && isOverdue(invoice));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Date helper functions
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = date instanceof Date ? date : date.toDate();
    return checkDate.getDate() === today.getDate() &&
           checkDate.getMonth() === today.getMonth() &&
           checkDate.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date) => {
    if (!date) return false;
    const now = new Date();
    const checkDate = date instanceof Date ? date : date.toDate();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() + 6));
    return checkDate >= startOfWeek && checkDate <= endOfWeek;
  };

  const isThisMonth = (date) => {
    if (!date) return false;
    const now = new Date();
    const checkDate = date instanceof Date ? date : date.toDate();
    return checkDate.getMonth() === now.getMonth() && checkDate.getFullYear() === now.getFullYear();
  };

  const isOverdue = (invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
    if (!invoice.dueDate) return false;
    
    const dueDate = invoice.dueDate instanceof Date ? invoice.dueDate : invoice.dueDate.toDate();
    const today = new Date();
    return dueDate < today;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Statistics
  const invoiceStats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    overdue: invoices.filter(inv => isOverdue(inv)).length,
    revenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
    pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.total || 0), 0),
    overdueAmount: invoices.filter(inv => isOverdue(inv)).reduce((sum, inv) => sum + (inv.total || 0), 0)
  };

  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      <div className='md:flex md:justify-end'>
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-own-2">Invoice Management</h2>
              <button 
                onClick={() => setShowInvoiceModal(true)}
                className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Invoice
              </button>
            </div>

            {/* Invoice Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-own-2">{invoiceStats.total}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-green-600">{invoiceStats.paid}</div>
                <div className="text-sm text-gray-600">Paid</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-yellow-600">{invoiceStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-red-600">{invoiceStats.overdue}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-emerald-600">₦{invoiceStats.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-yellow-600">₦{invoiceStats.pendingAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Pending Amount</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-red-600">₦{invoiceStats.overdueAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Overdue Amount</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices by number, customer, or order ID..."
                  className="pl-10 pr-4 py-3 w-full border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  className="px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading invoices...</span>
              </div>
            ) : (
              <>
                {/* Invoices Count */}
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredInvoices.length} of {invoices.length} invoices
                    {searchTerm && ` for "${searchTerm}"`}
                    {statusFilter !== "all" && ` with status "${statusFilter}"`}
                  </p>
                </div>

                {/* Invoices Table */}
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FontAwesomeIcon icon={faFileInvoice} className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {searchTerm ? 'No invoices found' : 'No invoices yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? `No results for "${searchTerm}"` : "Create your first invoice from a paid order"}
                    </p>
                    <button 
                      onClick={() => setShowInvoiceModal(true)}
                      className="bg-own-2 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Create Your First Invoice
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInvoices.map(invoice => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-own-2">{invoice.invoiceNumber}</div>
                                <div className="text-xs text-gray-500">ID: {invoice.id.slice(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                                <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {invoice.orderId ? `#${invoice.orderId.slice(0, 8)}` : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {invoice.issueDate?.toLocaleDateString() || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {invoice.dueDate?.toLocaleDateString() || 'N/A'}
                                </div>
                                {isOverdue(invoice) && (
                                  <div className="text-xs text-red-500">Overdue</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">₦{invoice.total?.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button 
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="text-own-2 hover:text-amber-600"
                                  title="View invoice"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button 
                                  onClick={() => generateTextInvoice(invoice)}
                                  disabled={generating}
                                  className="text-green-600 hover:text-green-900"
                                  title="Download as text file"
                                >
                                  {generating ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                  ) : (
                                    <FontAwesomeIcon icon={faDownload} />
                                  )}
                                </button>
                                <button 
                                  onClick={() => printInvoice(invoice)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Print invoice"
                                >
                                  <FontAwesomeIcon icon={faPrint} />
                                </button>
                                <button 
                                  onClick={() => shareInvoice(invoice)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Share invoice"
                                >
                                  <FontAwesomeIcon icon={faShare} />
                                </button>
                                <button 
                                  onClick={() => handleEditInvoice(invoice)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Edit invoice"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete invoice"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create/Edit Invoice Modal */}
          {showInvoiceModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">
                    {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowInvoiceModal(false);
                      resetInvoiceForm();
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handleInvoiceSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Customer Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={invoiceForm.orderId}
                          onChange={(e) => {
                            const selectedOrder = orders.find(o => o.id === e.target.value);
                            if (selectedOrder) {
                              setInvoiceForm({
                                ...invoiceForm,
                                orderId: e.target.value,
                                customerId: selectedOrder.customerId || "",
                                customerName: selectedOrder.customerName || "",
                                customerEmail: selectedOrder.customerEmail || "",
                                customerPhone: selectedOrder.customerPhone || "",
                                items: selectedOrder.items || [],
                                subtotal: selectedOrder.subtotal || 0,
                                tax: selectedOrder.tax || 0,
                                discount: selectedOrder.discount || 0,
                                total: selectedOrder.total || 0,
                                paymentMethod: selectedOrder.paymentMethod || ""
                              });
                            }
                          }}
                        >
                          <option value="">Select an order</option>
                          {orders.map(order => (
                            <option key={order.id} value={order.id}>
                              Order #{order.orderNumber} - {order.customerName} - ₦{order.total?.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={invoiceForm.invoiceNumber}
                          onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={invoiceForm.customerName}
                          onChange={(e) => setInvoiceForm({...invoiceForm, customerName: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={invoiceForm.customerEmail}
                            onChange={(e) => setInvoiceForm({...invoiceForm, customerEmail: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                          <input
                            type="tel"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={invoiceForm.customerPhone}
                            onChange={(e) => setInvoiceForm({...invoiceForm, customerPhone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Invoice Details</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
                          <input
                            type="date"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={invoiceForm.issueDate}
                            onChange={(e) => setInvoiceForm({...invoiceForm, issueDate: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                          <input
                            type="date"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={invoiceForm.dueDate}
                            onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={invoiceForm.status}
                          onChange={(e) => setInvoiceForm({...invoiceForm, status: e.target.value})}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {invoiceForm.status === 'paid' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              value={invoiceForm.paymentMethod}
                              onChange={(e) => setInvoiceForm({...invoiceForm, paymentMethod: e.target.value})}
                            >
                              <option value="">Select method</option>
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                              <option value="transfer">Bank Transfer</option>
                              <option value="wallet">Wallet</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                                value={invoiceForm.paymentDate}
                                onChange={(e) => setInvoiceForm({...invoiceForm, paymentDate: e.target.value})}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                                value={invoiceForm.referenceNumber}
                                onChange={(e) => setInvoiceForm({...invoiceForm, referenceNumber: e.target.value})}
                                placeholder="Transaction ID"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items Summary */}
                  {invoiceForm.items.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Invoice Items</h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Item</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Price</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Quantity</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceForm.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                  <td className="py-3 px-4">{item.name}</td>
                                  <td className="py-3 px-4">₦{formatCurrency(item.price)}</td>
                                  <td className="py-3 px-4">{item.quantity}</td>
                                  <td className="py-3 px-4 font-medium">₦{item.total?.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoice Summary */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Invoice Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₦{invoiceForm.subtotal.toLocaleString()}</span>
                        </div>
                        {invoiceForm.tax > 0 && (
                          <div className="flex justify-between">
                            <span>Tax (7.5%):</span>
                            <span>₦{invoiceForm.tax.toFixed(2)}</span>
                          </div>
                        )}
                        {invoiceForm.discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-₦{invoiceForm.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-own-2">₦{invoiceForm.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={invoiceForm.notes}
                      onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                      placeholder="Additional notes for this invoice..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Instructions</label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={invoiceForm.paymentInstructions}
                      onChange={(e) => setInvoiceForm({...invoiceForm, paymentInstructions: e.target.value})}
                      placeholder="Payment instructions for the customer..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInvoiceModal(false);
                        resetInvoiceForm();
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Invoice Details Modal */}
          {showInvoiceDetailsModal && selectedInvoice && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-own-2">Invoice Details</h3>
                    <p className="text-gray-600">Invoice #{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <button 
                    onClick={() => setShowInvoiceDetailsModal(false)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Actions */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-700 mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid', {
                          paymentMethod: 'cash',
                          referenceNumber: `REF-${Date.now()}`
                        })}
                        disabled={selectedInvoice.status === 'paid'}
                        className={`px-4 py-2 rounded-lg ${
                          selectedInvoice.status === 'paid' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => updateInvoiceStatus(selectedInvoice.id, 'pending')}
                        disabled={selectedInvoice.status === 'pending'}
                        className={`px-4 py-2 rounded-lg ${
                          selectedInvoice.status === 'pending' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } disabled:opacity-50`}
                      >
                        Mark as Pending
                      </button>
                      <button
                        onClick={() => updateInvoiceStatus(selectedInvoice.id, 'overdue')}
                        disabled={selectedInvoice.status === 'overdue'}
                        className={`px-4 py-2 rounded-lg ${
                          selectedInvoice.status === 'overdue' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } disabled:opacity-50`}
                      >
                        Mark as Overdue
                      </button>
                      <button
                        onClick={() => updateInvoiceStatus(selectedInvoice.id, 'cancelled')}
                        disabled={selectedInvoice.status === 'cancelled'}
                        className={`px-4 py-2 rounded-lg ${
                          selectedInvoice.status === 'cancelled' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        Cancel Invoice
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Invoice Information */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Invoice Information</h4>
                      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Invoice Number:</span>
                          <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="font-medium">
                            {selectedInvoice.orderId ? `#${selectedInvoice.orderId.slice(0, 8)}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issue Date:</span>
                          <span className="font-medium">
                            {selectedInvoice.issueDate?.toLocaleDateString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">
                            {selectedInvoice.dueDate?.toLocaleDateString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                            {selectedInvoice.status}
                          </span>
                        </div>
                        {selectedInvoice.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">{selectedInvoice.paymentMethod}</span>
                          </div>
                        )}
                        {selectedInvoice.referenceNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-medium">{selectedInvoice.referenceNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created By:</span>
                          <span className="font-medium">{selectedInvoice.createdBy || 'System'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
                      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedInvoice.customerName}</span>
                        </div>
                        {selectedInvoice.customerEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{selectedInvoice.customerEmail}</span>
                          </div>
                        )}
                        {selectedInvoice.customerPhone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedInvoice.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Invoice Items</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Item</th>
                              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Price</th>
                              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Quantity</th>
                              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedInvoice.items?.map((item, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 px-4">{item.name}</td>
                                <td className="py-3 px-4">₦{formatCurrency(item.price)}</td>
                                <td className="py-3 px-4">{item.quantity}</td>
                                <td className="py-3 px-4 font-medium">₦{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Invoice Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                        </div>
                        {selectedInvoice.tax > 0 && (
                          <div className="flex justify-between">
                            <span>Tax (7.5%):</span>
                            <span>{formatCurrency(selectedInvoice.tax)}</span>
                          </div>
                        )}
                        {selectedInvoice.discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-{formatCurrency(selectedInvoice.discount)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-own-2">{formatCurrency(selectedInvoice.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => generateTextInvoice(selectedInvoice)}
                      disabled={generating}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faDownload} />
                          Download as Text
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => printInvoice(selectedInvoice)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPrint} />
                      Print Invoice
                    </button>
                    <button
                      onClick={() => shareInvoice(selectedInvoice)}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faShare} />
                      Share Invoice
                    </button>
                    <button
                      onClick={() => setShowInvoiceDetailsModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Print Invoice Modal */}
          {showPrintModal && selectedInvoice && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">Print Invoice</h3>
                  <button 
                    onClick={() => setShowPrintModal(false)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="bg-white p-6 border-2 border-gray-200 rounded-lg" id="printable-invoice">
                  {/* Printable Invoice Content */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-own-2">AFRIKITCH RESTAURANT</h2>
                    <p className="text-gray-600">123 Restaurant Street, Lagos, Nigeria</p>
                    <p className="text-gray-600">Phone: +234 123 456 7890 | Email: info@afrikitch.com</p>
                  </div>

                  <div className="border-b-2 border-own-2 pb-4 mb-4">
                    <h1 className="text-3xl font-bold text-center text-gray-800">INVOICE</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="font-semibold">Invoice #:</p>
                      <p className="text-own-2 font-bold">{selectedInvoice.invoiceNumber}</p>
                      <p className="font-semibold mt-2">Issue Date:</p>
                      <p>{selectedInvoice.issueDate?.toLocaleDateString() || 'N/A'}</p>
                      <p className="font-semibold mt-2">Due Date:</p>
                      <p>{selectedInvoice.dueDate?.toLocaleDateString() || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Bill To:</p>
                      <p className="text-lg font-bold">{selectedInvoice.customerName}</p>
                      {selectedInvoice.customerEmail && <p>{selectedInvoice.customerEmail}</p>}
                      {selectedInvoice.customerPhone && <p>{selectedInvoice.customerPhone}</p>}
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedInvoice.status)}`}>
                          {selectedInvoice.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg border-b pb-2 mb-2">Invoice Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Description</th>
                            <th className="text-right py-2">Unit Price</th>
                            <th className="text-right py-2">Quantity</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.items?.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{item.name}</td>
                              <td className="text-right py-2">₦{item.price?.toLocaleString()}</td>
                              <td className="text-right py-2">{item.quantity}</td>
                              <td className="text-right py-2 font-medium">₦{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="text-right mb-6">
                    <div className="inline-block text-left">
                      <div className="flex justify-between mb-1">
                        <span className="mr-4">Subtotal:</span>
                        <span>₦{selectedInvoice.subtotal?.toLocaleString()}</span>
                      </div>
                      {selectedInvoice.tax > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="mr-4">Tax (7.5%):</span>
                          <span>₦{selectedInvoice.tax?.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedInvoice.discount > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="mr-4">Discount:</span>
                          <span>-₦{selectedInvoice.discount?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                        <span className="mr-4">Total:</span>
                        <span className="text-own-2">₦{selectedInvoice.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 text-sm text-gray-600">
                    <p className="font-semibold">Payment Instructions:</p>
                    <p>{selectedInvoice.paymentInstructions || "Payment due within 7 days. Late payments subject to 5% fee."}</p>
                    {selectedInvoice.notes && (
                      <>
                        <p className="font-semibold mt-2">Notes:</p>
                        <p>{selectedInvoice.notes}</p>
                      </>
                    )}
                    <p className="text-center mt-4">Thank you for your business!</p>
                    <p className="text-center text-xs">This is a computer-generated invoice. No signature required.</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPrint} />
                    Print Now
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <style jsx>{`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                      visibility: visible;
                    }
                    #printable-invoice {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      padding: 20px;
                    }
                  }
                `}</style>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}