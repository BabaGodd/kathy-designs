/* =============================================
   SUPABASE.JS — Kathy Designs
   Central Supabase client and helper functions.
   Add this file to your project root folder.
   ============================================= */

const SUPABASE_URL  = 'https://hkrnxfylhvfnqovduxjc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrcm54ZnlsaHZmbnFvdmR1eGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Nzk2OTEsImV4cCI6MjA5NDQ1NTY5MX0.zQKABL_eXWDtiEBDIsqN-sEoXsZR0Bc4NIRMO8kdJLw';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ================================================
   ORDERS
================================================ */

async function saveOrderToSupabase(orderDetails) {
  const { error } = await db.from('orders').insert([{
    order_id:         orderDetails.orderID,
    customer_name:    orderDetails.customer.name,
    customer_email:   orderDetails.customer.email,
    customer_phone:   orderDetails.customer.phone,
    customer_address: orderDetails.customer.address,
    items:            orderDetails.items,
    subtotal:         orderDetails.subtotal,
    delivery_fee:     orderDetails.deliveryFee,
    total:            orderDetails.total,
    payment_method:   orderDetails.paymentMethod,
    delivery_method:  orderDetails.deliveryMethod,
    notes:            orderDetails.notes,
    status:           'Pending'
  }]);
  if (error) { console.error('Save order error:', error.message); return false; }
  return true;
}

async function fetchAllOrders() {
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Fetch orders error:', error.message); return []; }
  return data.map(row => ({
    orderID:        row.order_id,
    customer: {
      name:    row.customer_name,
      email:   row.customer_email,
      phone:   row.customer_phone,
      address: row.customer_address,
    },
    items:          row.items,
    subtotal:       row.subtotal,
    deliveryFee:    row.delivery_fee,
    total:          row.total,
    paymentMethod:  row.payment_method,
    deliveryMethod: row.delivery_method,
    notes:          row.notes,
    status:         row.status,
    date:           row.created_at,
    _supabaseId:    row.id
  }));
}

async function updateOrderStatus(supabaseId, newStatus) {
  const { error } = await db.from('orders').update({ status: newStatus }).eq('id', supabaseId);
  if (error) { console.error('Update order error:', error.message); return false; }
  return true;
}

async function deleteOrder(supabaseId) {
  const { error } = await db.from('orders').delete().eq('id', supabaseId);
  if (error) { console.error('Delete order error:', error.message); return false; }
  return true;
}

/* ================================================
   MESSAGES
================================================ */

async function saveMessageToSupabase(messageData) {
  const { error } = await db.from('messages').insert([{
    name:    messageData.name,
    email:   messageData.email,
    subject: messageData.subject,
    message: messageData.message,
    status:  'Unread'
  }]);
  if (error) { console.error('Save message error:', error.message); return false; }
  return true;
}

async function fetchAllMessages() {
  const { data, error } = await db
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Fetch messages error:', error.message); return []; }
  return data.map(row => ({
    name:        row.name,
    email:       row.email,
    subject:     row.subject,
    message:     row.message,
    status:      row.status,
    date:        row.created_at,
    _supabaseId: row.id
  }));
}

async function updateMessageStatus(supabaseId, newStatus) {
  const { error } = await db.from('messages').update({ status: newStatus }).eq('id', supabaseId);
  if (error) { console.error('Update message error:', error.message); return false; }
  return true;
}

async function deleteMessage(supabaseId) {
  const { error } = await db.from('messages').delete().eq('id', supabaseId);
  if (error) { console.error('Delete message error:', error.message); return false; }
  return true;
}

/* ================================================
   PRODUCTS
================================================ */

async function fetchAllProducts() {
  const { data, error } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Fetch products error:', error.message); return []; }
  return data.map(row => ({
    id:          row.id,
    name:        row.name,
    price:       row.price,
    category:    row.category,
    image:       row.image,
    stock:       row.stock,
    description: row.description,
    _supabaseId: row.id
  }));
}

async function saveProductToSupabase(product) {
  const { error } = await db.from('products').insert([{
    name:        product.name,
    price:       product.price,
    category:    product.category,
    image:       product.image,
    stock:       product.stock,
    description: product.description || ''
  }]);
  if (error) { console.error('Save product error:', error.message); return false; }
  return true;
}

async function updateProductInSupabase(supabaseId, product) {
  const { error } = await db.from('products').update({
    name:        product.name,
    price:       product.price,
    category:    product.category,
    image:       product.image,
    stock:       product.stock,
    description: product.description || ''
  }).eq('id', supabaseId);
  if (error) { console.error('Update product error:', error.message); return false; }
  return true;
}

async function deleteProductFromSupabase(supabaseId) {
  const { error } = await db.from('products').delete().eq('id', supabaseId);
  if (error) { console.error('Delete product error:', error.message); return false; }
  return true;
}