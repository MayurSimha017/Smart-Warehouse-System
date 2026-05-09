import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Scanner from './Scanner';
import './App.css';

function App() {
  // 1. ALL STATE DEFINITIONS (These fix your "not defined" errors)
  const [products, setProducts] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 2. FETCH DATA FROM BACKEND
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/products/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setToken(null);
        localStorage.removeItem('token');
      }
    }
  };

  // 3. LOGIN / LOGOUT LOGIC
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('token', res.data.access);
      setToken(res.data.access);
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // 4. STOCK UPDATE LOGIC
  const updateStock = async (id, newQuantity) => {
    if (newQuantity < 0) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/products/${id}/`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleScan = (sku) => {
    const product = products.find(p => p.sku === sku.trim());
    if (product) {
      updateStock(product.id, product.quantity + 1);
      alert(`Updated ${product.name}`);
      setShowScanner(false);
    } else {
      alert("SKU not found in system");
    }
  };

  // Run fetch when token changes
  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  // 5. ANALYTICS CALCULATIONS
  const lowStockItems = products.filter(p => p.quantity < 10);
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);


  // 1. The state to hold what the user types
  const [searchTerm, setSearchTerm] = useState('');

  // 2. The filtered list (This updates automatically whenever searchTerm changes)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const [chatInput, setChatInput] = useState('');

  const [showChat, setShowChat] = useState(false);

  const handleChatCommand = () => {
    const input = chatInput.toLowerCase();

    // Example command: "add 10 LAP-001"
    if (input.includes('add') || input.includes('remove')) {
      const parts = input.split(' '); // ["add", "10", "LAP-001"]
      const action = parts[0];
      const amount = parseInt(parts[1]);
      const sku = parts[2].toUpperCase();

      const product = products.find(p => p.sku === sku);
      if (product) {
        const newQty = action === 'add' ? product.quantity + amount : product.quantity - amount;
        updateStock(product.id, newQty);
        alert(`Chatbot: Successfully updated ${product.name}`);
      } else {
        alert("Chatbot: Sorry, I couldn't find that SKU.");
      }
    }
    setChatInput('');
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', price: '', category: '', quantity: 0
  });

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/products/', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddForm(false);
      setNewProduct({ name: '', sku: '', price: '', category: '', quantity: 0 }); // Reset
      fetchProducts(); // Refresh list
      alert("New product added successfully!");
    } catch (err) {
      alert("Error adding product. Check if SKU is unique.");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (err) {
        alert("Error deleting product.");
      }
    }
  };

  // 6. RENDER LOGIN SCREEN IF NO TOKEN
  if (!token) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Warehouse Login</h2>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // 7. RENDER MAIN DASHBOARD
  return (
    <div className="App">
      <header className="dashboard-header">
        <div>
          <h1>Smart Warehouse Management</h1>
          <p>Logged in as: Admin</p>
        </div>
        <div className="stats-container">
          <div className="stat-card">
            <h3>Inventory Value</h3>
            <p className="stat-value">${totalValue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Alerts</h3>
            <p className="stat-value" style={{ color: '#ff3860' }}>{lowStockItems.length}</p>
          </div>
          <button onClick={handleLogout} className="btn-remove" style={{ marginLeft: '20px' }}>Logout</button>
        </div>
      </header>

      <section className="analytics-section">
        <h2 style={{ color: '#00d1b2' }}>Stock Level Monitor</h2>
        <div style={{ width: '100%', height: 250, background: '#1e1e1e', padding: '20px', borderRadius: '10px' }}>
          <ResponsiveContainer>
            <BarChart data={products}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
              <Bar dataKey="quantity">
                {products.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.quantity < 10 ? '#ff3860' : '#00d1b2'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <button className="scan-btn" onClick={() => setShowScanner(!showScanner)}>
        {showScanner ? "❌ Close Scanner" : "📸 Scan QR to Add Stock"}
      </button>

      {showScanner && <Scanner onScanSuccess={handleScan} />}

      <div className="action-bar" style={{ display: 'flex', gap: '10px' }}>
        <button className="scan-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "➕ Add New Item Type"}
        </button>
        {/* Your existing scan button stays here too */}
      </div>

      {showAddForm && (
        <form className="add-product-form" onSubmit={addProduct}>
          <h3>Register New Inventory Item</h3>
          <div className="form-grid">
            <input type="text" placeholder="Product Name" required onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input type="text" placeholder="SKU (e.g. LAP-003)" required onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
            <input type="number" placeholder="Price" required onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
            <input type="text" placeholder="Category" required onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
            <input type="number" placeholder="Initial Stock" onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} />
          </div>
          <button type="submit" className="btn-add" style={{ marginTop: '10px', width: '100%' }}>Save to Warehouse</button>
        </form>
      )}

      <div className="search-container" style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="🔍 Search by Name or SKU..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            background: '#252525',
            color: 'white',
            border: '1px solid #00d1b2'
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // This triggers the filter
        />
      </div>
      <div className="inventory-list">
        <h2>Live Inventory Table</h2>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Stock</th>
              <th>Status</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td><code>{p.sku}</code></td>
                <td>{p.name}</td>
                <td>{p.quantity}</td>
                <td>
                  <span className={`status-pill ${p.quantity < 10 ? 'critical' : 'healthy'}`}>
                    {p.quantity < 10 ? 'Low Stock' : 'Good'}
                  </span>
                </td>
                <td><QRCodeSVG value={p.sku} size={40} /></td>
                <td>
                  <button className="btn-add" onClick={() => updateStock(p.id, p.quantity + 1)}>+</button>
                  <button className="btn-remove" onClick={() => updateStock(p.id, p.quantity - 1)}>-</button>
                  {/* NEW DELETE BUTTON */}
                  <button
                    onClick={() => deleteProduct(p.id)}
                    style={{ marginLeft: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Delete Item"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* --- FLOATING CHATBOT WIDGET --- */}
      <div className="chatbot-container">
        {/* The actual Chat Window (only shows if showChat is true) */}
        {showChat && (
          <div className="chatbot-window">
            <div className="chat-header">
              <h4>AI Assistant</h4>
              <button onClick={() => setShowChat(false)}>✖</button>
            </div>
            <div className="chat-body">
              <p>Try commands like:</p>
              <code>add 10 SKU-123</code>
            </div>
            <div className="chat-footer">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type command..."
                onKeyPress={(e) => e.key === 'Enter' && handleChatCommand()}
              />
              <button onClick={handleChatCommand}>Send</button>
            </div>
          </div>
        )}

        {/* The Floating Toggle Button */}
        <button className="chat-toggle-btn" onClick={() => setShowChat(!showChat)}>
          {showChat ? "💬" : "🤖"}
        </button>
      </div>

    </div>

  );
}

export default App;