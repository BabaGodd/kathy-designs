document.addEventListener("DOMContentLoaded", () => {
  const orderData = JSON.parse(localStorage.getItem("kathyOrderDetails"));

  if (!orderData) {
    alert("No order found. Please complete checkout first.");
    window.location.href = "checkout.html";
    return;
  }

  document.getElementById("kathy-order-id").textContent = orderData.orderID;
  document.getElementById("kathy-customer-name").textContent = orderData.customer.name;
  document.getElementById("kathy-customer-email").textContent = orderData.customer.email;
  document.getElementById("kathy-customer-phone").textContent = orderData.customer.phone;
  document.getElementById("kathy-customer-address").textContent = orderData.customer.address;
  document.getElementById("kathy-order-total").textContent = orderData.total.toFixed(2);

  const itemsList = document.getElementById("kathy-order-items");
  itemsList.innerHTML = "";

  orderData.items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - GHC ${item.price.toFixed(2)} × ${item.quantity} = GHC ${(item.price * item.quantity).toFixed(2)}`;
    itemsList.appendChild(li);
  });

  localStorage.removeItem("kathyCart");
  localStorage.removeItem("cartCount");
});
