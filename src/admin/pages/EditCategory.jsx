import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from "react-router-dom";
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import ImageUploadBox from '../components/ImageUploadBox';

export default function EditCategory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => {
  setIsSidebarOpen(prev => {
    const newState = !prev;    return newState;
    });
    };

    const { id } = useParams();   // will be undefined in add mode
  const location = useLocation();
  const menuItem = location.state; // row data passed from AllMenu when editing

  const isEditMode = Boolean(id);

    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Snacks', 'Dessert'];
  const [menuImage, setMenuImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    ingredients: '',
    description: '',
    category: [],
  });

  const handleChange = (e) => {
  const { name, value, options, multiple } = e.target;

  if (multiple) {
    const selectedOptions = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);

    setFormData(prev => ({ ...prev, [name]: selectedOptions }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

  const handleReset = () => {
    setFormData({
      name: '',
      quantity: '',
      price: '',
      ingredients: '',
      description: '',
      category: [],
    });
    setMenuImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const completeData = {
      ...formData,
      image: menuImage,
    };

    if (isEditMode) {
      console.log("Updating menu item:", id, completeData);
      // axios.put(`/api/menu/${id}`, completeData)
    } else {
      console.log("Adding new menu item:", completeData);
      // axios.post(`/api/menu`, completeData)
    }
  };


  useEffect(() => {
    if (isEditMode && menuItem) {
      setFormData({
        name: menuItem.name || "",
        quantity: menuItem.quantity || "",
        price: menuItem.price || "",
        ingredients: menuItem.ingredients || "",
        description: menuItem.description || "",
        category: menuItem.category ? menuItem.category.split(",") : [],
      });
      setMenuImage(menuItem.image || null);
    }
  }, [isEditMode, menuItem]);



  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebar} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} activeLink="/admin/menu/add"/>
      <div className='md:flex md:justify-end'>
        <form onSubmit={handleSubmit} className={`pt-32 pb-10 px-5 md:px-10 md:flex md:justify-between md:gap-16 ${isSidebarOpen ? "md:w-[75%] lg:w-[80%]" : "md:w-full"} transition-all duration-500`}>
          <ImageUploadBox onImageSelect={setMenuImage} page="Category"/>
          <div className='md:w-[50%]'>
            <h2 className='text-left w-full text-2xl mb-3.5 font-semibold font-display2'>General Information</h2>
            <div className='flex flex-col md:flex-row gap-5 justify-between'>
                <div className="mb-6 md:w-[45%]">
                    <fieldset className="relative border border-own-2 rounded-lg px-4 pt-4 pb-4">
                        <legend className=" splay font-light px-2">Name</legend>
                        <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter name of the cuisine"
                        required
                        className="w-full focus:outline-none"
                        />
                    </fieldset>
                </div>

                <div className="mb-6 md:w-[45%]">
                    <fieldset className="relative border border-own-2 rounded-lg px-4 pt-4 pb-4">
                        <legend className="font-display font-light 500 px-2">Quantity</legend>
                        <input
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="Enter quantity"
                        required
                        type="number"
                        className="w-full focus:outline-none"
                        />
                    </fieldset>
                </div>
            </div>

            <div className='flex flex-col md:flex-row gap-5 justify-between'>
                <div className="mb-6 md:w-[45%]">
                    <fieldset className="relative border border-own-2 rounded-lg px-4 pt-4 pb-4">
                        <legend className="font-display font-light 500 px-2">Price</legend>
                        <input
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        required
                        type="number"
                        className="w-full focus:outline-none"
                        />
                    </fieldset>
                </div>
                <div className="mb-8 md:w-[45%]">
                    <fieldset className="relative border border-own-2 rounded-lg px-4 pt-4 pb-4">
                        <legend className="font-display font-light 500 px-2">Category</legend>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            multiple
                            required
                            className="w-full  bg-own-1 text-white border border-none font-display font-light rounded-lg focus:outline-none">
                            <option value="" disabled hidden>Select Category</option>
                            {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </fieldset>
                </div>
            </div>

                <div className="mb-6">
                <fieldset className="relative border border-own-2 rounded-lg px-4 pt-4 pb-4">
                    <legend className="font-display font-light 500 px-2">Ingredients</legend>
                    <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ingredients should be separated with a comma (,)"
                    className="w-full focus:outline-none resize-none"
                    ></textarea>
                </fieldset>
                </div>

                <div className="mb-6">
                <fieldset className="relative border border-own-2 rounded-lg px-4 pt-4 pb-4">
                    <legend className="font-display font-light 500 px-2">Description</legend>
                    <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Brief Descripttion"
                    className="w-full focus:outline-none resize-none text-whtie"
                    ></textarea>
                </fieldset>
                </div>


            {/* Buttons */}
            <div className="flex justify-between">
                <button
                type="reset"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-300 rounded-lg text-black font-semibold font-display hover:bg-gray-400 transition"
                >
                Clear
                </button>
                <button
                type="submit"
                className="px-6 py-3 bg-own-2 text-black font-semibold font-display rounded-lg hover:bg-own-2-dark transition"
                >
                {isEditMode ? "Update Menu" : "Save To Menu"}
                </button>
                </div>
            </div>
        </form>
      </div>
    </>
  );
}
