import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faDollarSign, 
  faEdit, 
  faPlus, 
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
  faCheckCircle,
  faClock,
  faTruck,
  faPrint,
  faFileInvoice,
  faBan,
  faCheck,
  faCalendarAlt,
  faPhone,
  faMapMarkerAlt,
  faCreditCard,
  faUserCircle
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
  getDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Orders() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("Orders");
  
  // Firebase data states
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  // Order form state
  const [orderForm, setOrderForm] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    orderType: "delivery", // delivery, pickup, dine-in
    paymentMethod: "cash", // cash, card, transfer, wallet
    paymentStatus: "pending", // pending, paid, failed, refunded
    orderStatus: "pending", // pending, confirmed, preparing, ready, delivered, completed, cancelled
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: ""
  });

  // Selected item for order
  const [selectedItem, setSelectedItem] = useState({
    id: "",
    name: "",
    price: 0,
    quantity: 1,
    notes: ""
  });

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch data from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date()
      }));
      setOrders(ordersList);

      // Fetch menu items for order creation
      const menuQuery = query(collection(db, "menus"), where("available", "==", true));
      const menuSnapshot = await getDocs(menuQuery);
      const menuList = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuList);

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
    return `INV-${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
  };

  // Check if invoice exists for order
  const checkInvoiceExists = async (orderId) => {
    try {
      const invoicesQuery = query(
        collection(db, "invoices"), 
        where("orderId", "==", orderId)
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);
      return !invoicesSnapshot.empty;
    } catch (error) {
      console.error("Error checking invoice:", error);
      return false;
    }
  };

  // Create invoice in database
  const createInvoiceInDB = async (order) => {
    try {
      const invoiceExists = await checkInvoiceExists(order.id);
      if (invoiceExists) {
        return true; // Invoice already exists
      }

      const invoiceNumber = generateInvoiceNumber();
      const invoiceData = {
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
        referenceNumber: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "invoices"), invoiceData);
      return true;
    } catch (error) {
      console.error("Error creating invoice:", error);
      return false;
    }
  };

  // Handle order submission
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (orderForm.items.length === 0) {
        alert("Please add at least one item to the order.");
        setSaving(false);
        return;
      }

      const orderData = {
        ...orderForm,
        subtotal: parseFloat(orderForm.subtotal) || 0,
        deliveryFee: parseFloat(orderForm.deliveryFee) || 0,
        tax: parseFloat(orderForm.tax) || 0,
        discount: parseFloat(orderForm.discount) || 0,
        total: parseFloat(orderForm.total) || 0,
        createdAt: editingOrder ? orderForm.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderNumber: editingOrder ? orderForm.orderNumber : generateOrderNumber(),
        assignedTo: userData.name,
        estimatedDeliveryTime: calculateDeliveryTime()
      };

      if (editingOrder) {
        // Update existing order
        await updateDoc(doc(db, "orders", editingOrder.id), orderData);
      } else {
        // Add new order
        await addDoc(collection(db, "orders"), orderData);
      }

      // Reset form and close modal
      resetOrderForm();
      setShowOrderModal(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
  };

  // Calculate delivery time
  const calculateDeliveryTime = () => {
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    return deliveryTime;
  };

  // Handle edit order
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setOrderForm({
      customerId: order.customerId || "",
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      customerEmail: order.customerEmail || "",
      deliveryAddress: order.deliveryAddress || "",
      deliveryInstructions: order.deliveryInstructions || "",
      orderType: order.orderType || "delivery",
      paymentMethod: order.paymentMethod || "cash",
      paymentStatus: order.paymentStatus || "pending",
      orderStatus: order.orderStatus || "pending",
      items: order.items || [],
      subtotal: order.subtotal || 0,
      deliveryFee: order.deliveryFee || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total || 0,
      notes: order.notes || "",
      orderNumber: order.orderNumber || generateOrderNumber(),
      createdAt: order.createdAt
    });
    setShowOrderModal(true);
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  // Handle delete order
  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, "orders", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order. Please try again.");
      }
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchData();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchData();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          paymentStatus: newStatus
        });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status. Please try again.");
    }
  };

  // Add item to order
  const addItemToOrder = () => {
    if (!selectedItem.id || selectedItem.quantity <= 0) {
      alert("Please select a valid item and quantity.");
      return;
    }

    const existingItemIndex = orderForm.items.findIndex(item => item.id === selectedItem.id);
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      const updatedItems = [...orderForm.items];
      updatedItems[existingItemIndex].quantity += selectedItem.quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
      setOrderForm({
        ...orderForm,
        items: updatedItems
      });
    } else {
      // Add new item
      const newItem = {
        ...selectedItem,
        total: selectedItem.price * selectedItem.quantity
      };
      setOrderForm({
        ...orderForm,
        items: [...orderForm.items, newItem]
      });
    }

    // Clear selected item
    setSelectedItem({
      id: "",
      name: "",
      price: 0,
      quantity: 1,
      notes: ""
    });

    // Recalculate totals immediately
    calculateTotals();
  };

  // Remove item from order
  const removeItemFromOrder = (index) => {
    const updatedItems = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({
      ...orderForm,
      items: updatedItems
    });
    calculateTotals();
  };

  // Update item quantity
  const updateItemQuantity = (index, newQuantity) => {
    const updatedItems = [...orderForm.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].price * newQuantity;
    setOrderForm({
      ...orderForm,
      items: updatedItems
    });
    calculateTotals();
  };

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = orderForm.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const deliveryFee = parseFloat(orderForm.deliveryFee) || 0;
    const tax = subtotal * 0.075; // 7.5% tax
    const discount = parseFloat(orderForm.discount) || 0;
    const total = subtotal + deliveryFee + tax - discount;
    
    setOrderForm(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  // Reset order form
  const resetOrderForm = () => {
    setOrderForm({
      customerId: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      deliveryInstructions: "",
      orderType: "delivery",
      paymentMethod: "cash",
      paymentStatus: "pending",
      orderStatus: "pending",
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: ""
    });
    setSelectedItem({
      id: "",
      name: "",
      price: 0,
      quantity: 1,
      notes: ""
    });
    setEditingOrder(null);
  };

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && isToday(order.createdAt)) ||
      (dateFilter === "week" && isThisWeek(order.createdAt)) ||
      (dateFilter === "month" && isThisMonth(order.createdAt));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Date helper functions
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isThisMonth = (date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-indigo-100 text-indigo-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Create invoice
  const createInvoice = async (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  // Print invoice with database check
  const printInvoice = async () => {
    if (!selectedOrder) return;
    
    try {
      // Check if invoice already exists
      const invoiceExists = await checkInvoiceExists(selectedOrder.id);
      
      if (!invoiceExists) {
        // Create invoice in database
        const invoiceCreated = await createInvoiceInDB(selectedOrder);
        if (!invoiceCreated) {
          alert("Failed to create invoice in database. Please try again.");
          return;
        }
        alert("Invoice created successfully in database.");
      } else {
        alert("Invoice already exists in database.");
      }
      
      // Print the invoice
      window.print();
      
    } catch (error) {
      console.error("Error printing invoice:", error);
      alert("Error processing invoice. Please try again.");
    }
  };

  // Statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    preparing: orders.filter(o => o.orderStatus === 'preparing').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'completed').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
    today: orders.filter(o => isToday(o.createdAt)).length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
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
              <h2 className="text-2xl font-bold text-own-2">Order Management</h2>
              <button 
                onClick={() => setShowOrderModal(true)}
                className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Order
              </button>
            </div>

            {/* Order Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-own-2">{orderStats.total}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-indigo-600">{orderStats.preparing}</div>
                <div className="text-sm text-gray-600">Preparing</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-blue-600">{orderStats.today}</div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-2xl font-bold text-emerald-600">₦{orderStats.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue</div>
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
                  placeholder="Search orders by ID, customer, phone, or address..."
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
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
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
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading orders...</span>
              </div>
            ) : (
              <>
                {/* Orders Count */}
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredOrders.length} of {orders.length} orders
                    {searchTerm && ` for "${searchTerm}"`}
                    {statusFilter !== "all" && ` with status "${statusFilter}"`}
                  </p>
                </div>

                {/* Orders Table */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {searchTerm ? 'No orders found' : 'No orders yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? `No results for "${searchTerm}"` : "Start by adding your first order"}
                    </p>
                    <button 
                      onClick={() => setShowOrderModal(true)}
                      className="bg-own-2 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Add Your First Order
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-own-2">{order.orderNumber}</div>
                                <div className="text-xs text-gray-500">ID: {order.id.slice(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                <div className="text-xs text-gray-500">{order.customerPhone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.createdAt?.toLocaleDateString() || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.createdAt?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  order.orderType === 'delivery' ? 'bg-blue-100 text-blue-800' :
                                  order.orderType === 'pickup' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {order.orderType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">₦{order.total?.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button 
                                  onClick={() => handleViewOrder(order)}
                                  className="text-own-2 hover:text-amber-600"
                                  title="View details"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button 
                                  onClick={() => handleEditOrder(order)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit order"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button 
                                  onClick={() => createInvoice(order)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Create invoice"
                                >
                                  <FontAwesomeIcon icon={faFileInvoice} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete order"
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

          {/* Add/Edit Order Modal */}
          {showOrderModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">
                    {editingOrder ? 'Edit Order' : 'Create New Order'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowOrderModal(false);
                      resetOrderForm();
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handleOrderSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Customer Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={orderForm.customerName}
                          onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                          <input
                            type="tel"
                            required
                            className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={orderForm.customerPhone}
                            onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={orderForm.customerEmail}
                            onChange={(e) => setOrderForm({...orderForm, customerEmail: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Order Details</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                        <select
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={orderForm.orderType}
                          onChange={(e) => setOrderForm({...orderForm, orderType: e.target.value})}
                        >
                          <option value="delivery">Delivery</option>
                          <option value="pickup">Pickup</option>
                          <option value="dine-in">Dine-in</option>
                        </select>
                      </div>

                      {orderForm.orderType === 'delivery' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                          <textarea
                            required
                            rows={2}
                            className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={orderForm.deliveryAddress}
                            onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={orderForm.paymentMethod}
                          onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="transfer">Bank Transfer</option>
                          <option value="wallet">Wallet</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                          <select
                            className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={orderForm.orderStatus}
                            onChange={(e) => setOrderForm({...orderForm, orderStatus: e.target.value})}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                          <select
                            className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            value={orderForm.paymentStatus}
                            onChange={(e) => setOrderForm({...orderForm, paymentStatus: e.target.value})}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Items */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Add Items to Order</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
                        <select
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={selectedItem.id}
                          onChange={(e) => {
                            const selected = menuItems.find(item => item.id === e.target.value);
                            setSelectedItem({
                              ...selectedItem,
                              id: e.target.value,
                              name: selected?.name || "",
                              price: selected?.price || 0
                            });
                          }}
                        >
                          <option value="" disabled>Select an item</option>
                          {menuItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} - ₦{item.price?.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={selectedItem.quantity}
                          onChange={(e) => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value) || 1})}
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addItemToOrder}
                          className="w-full bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    {orderForm.items.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-medium text-gray-700 mb-3">Order Items</h5>
                        <div className="space-y-2">
                          {orderForm.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                              <div>
                                <div className="font-medium text-own-2">{item.name}</div>
                                <div className="text-sm text-gray-500">
                                  ₦{item.price?.toLocaleString()} × {item.quantity} = ₦{item.total?.toLocaleString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="w-20 px-2 py-1 border text-black border-gray-300 rounded"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeItemFromOrder(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-700 mb-3">Order Summary</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-black">
                        <span>Subtotal:</span>
                        <span>₦{orderForm.subtotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-black">
                        <span>Delivery Fee:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            className="w-32 px-2 py-1 border border-gray-300 rounded"
                            value={orderForm.deliveryFee}
                            onChange={(e) => {
                              setOrderForm({...orderForm, deliveryFee: e.target.value});
                              calculateTotals();
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-black">
                        <span>Tax (7.5%):</span>
                        <span>₦{orderForm.tax.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-black">
                        <span>Discount:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            className="w-32 px-2 py-1 border border-gray-300 rounded"
                            value={orderForm.discount}
                            onChange={(e) => {
                              setOrderForm({...orderForm, discount: e.target.value});
                              calculateTotals();
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-300 pt-2 mt-2 text-black">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-own-2">₦{orderForm.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                      placeholder="Any special instructions or notes..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          {editingOrder ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingOrder ? 'Update Order' : 'Create Order'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOrderModal(false);
                        resetOrderForm();
                      }}
                      disabled={saving}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Order Details Modal */}
          {showOrderDetailsModal && selectedOrder && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-own-2">Order Details</h3>
                    <p className="text-gray-600">Order #{selectedOrder.orderNumber}</p>
                  </div>
                  <button 
                    onClick={() => setShowOrderDetailsModal(false)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Status Actions */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-700 mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          disabled={selectedOrder.orderStatus === status}
                          className={`px-4 py-2 rounded-lg ${
                            selectedOrder.orderStatus === status 
                              ? 'bg-own-2 text-white' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
                      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUserCircle} className="text-own-2 mr-3" />
                          <div>
                            <div className="font-medium">{selectedOrder.customerName}</div>
                            <div className="text-sm text-gray-500">{selectedOrder.customerEmail}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faPhone} className="text-own-2 mr-3" />
                          <div>{selectedOrder.customerPhone}</div>
                        </div>
                        {selectedOrder.deliveryAddress && (
                          <div className="flex items-start">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-own-2 mr-3 mt-1" />
                            <div>
                              <div className="font-medium">Delivery Address</div>
                              <div className="text-sm">{selectedOrder.deliveryAddress}</div>
                              {selectedOrder.deliveryInstructions && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Instructions: {selectedOrder.deliveryInstructions}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Information */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Order Information</h4>
                      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Type:</span>
                          <span className="font-medium">{selectedOrder.orderType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium">
                            {selectedOrder.createdAt?.toLocaleDateString()} {selectedOrder.createdAt?.toLocaleTimeString()}
                          </span>
                        </div>
                        {selectedOrder.assignedTo && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Assigned To:</span>
                            <span className="font-medium">{selectedOrder.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
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
                            {selectedOrder.items?.map((item, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 px-4">
                                  <div className="font-medium">{item.name}</div>
                                  {item.notes && (
                                    <div className="text-xs text-gray-500">Note: {item.notes}</div>
                                  )}
                                </td>
                                <td className="py-3 px-4">₦{item.price?.toLocaleString()}</td>
                                <td className="py-3 px-4">{item.quantity}</td>
                                <td className="py-3 px-4 font-medium">₦{item.total?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Order Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₦{selectedOrder.subtotal?.toLocaleString()}</span>
                        </div>
                        {selectedOrder.deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                          <span>₦{selectedOrder.deliveryFee?.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedOrder.tax > 0 && (
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>₦{selectedOrder.tax?.toFixed(2)}</span>
                          </div>
                        )}
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-₦{selectedOrder.discount?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-own-2">₦{selectedOrder.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Additional Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => createInvoice(selectedOrder)}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faFileInvoice} />
                      Create Invoice
                    </button>
                    <button
                      onClick={() => setShowOrderDetailsModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Modal */}
          {showInvoiceModal && selectedOrder && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto" id="invoice">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-own-2">INVOICE</h2>
                    <p className="text-gray-600">Order #{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-own-2">AfriKitch Restaurant</div>
                    <div className="text-sm text-gray-600">123 Restaurant Street, Lagos</div>
                    <div className="text-sm text-gray-600">Phone: +234 123 456 7890</div>
                    <div className="text-sm text-gray-600">Email: info@afrikitch.com</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Bill To:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium">{selectedOrder.customerName}</div>
                      <div>{selectedOrder.customerPhone}</div>
                      <div>{selectedOrder.customerEmail}</div>
                      {selectedOrder.deliveryAddress && (
                        <div className="mt-2">
                          <div className="text-sm font-medium">Delivery Address:</div>
                          <div className="text-sm">{selectedOrder.deliveryAddress}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Invoice Details:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span>Invoice Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Order Date:</span>
                        <span>{selectedOrder.createdAt?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Order Type:</span>
                        <span>{selectedOrder.orderType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border">Unit Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border">Quantity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4 border">{item.name}</td>
                          <td className="py-3 px-4 border">₦{item.price?.toLocaleString()}</td>
                          <td className="py-3 px-4 border">{item.quantity}</td>
                          <td className="py-3 px-4 border">₦{item.total?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="ml-auto w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₦{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>₦{selectedOrder.deliveryFee?.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax (7.5%):</span>
                        <span>₦{selectedOrder.tax?.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₦{selectedOrder.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-own-2">₦{selectedOrder.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600">
                    Payment is due within 30 days. Late payments are subject to fees. All prices are in Nigerian Naira (₦).
                  </p>
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    onClick={printInvoice}
                    className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPrint} />
                    Print Invoice
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}