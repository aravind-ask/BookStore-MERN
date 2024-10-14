import React from 'react'

export default function temp() {
  return (
    <div class="container mx-auto">
      <div class="flex justify-between">
        <div class="w-2/3">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 text-left text-blue-900">Product</th>
                <th class="py-2 text-left text-blue-900">Price</th>
                <th class="py-2 text-left text-blue-900">Quantity</th>
                <th class="py-2 text-left text-blue-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item,index) => (
                <tr key={item.id} class="border-t">
                  <td class="py-2 flex items-center">
                    <img
                      src={item.images}
                      alt={`Image of ${item.title}`}
                      class="w-16 h-16 mr-4"
                    />
                    <div>
                      <div>{item.title}</div>
                      <div class="text-gray-500">Color: {item.color}</div>
                      <div class="text-gray-500">Size: {item.size}</div>
                    </div>
                  </td>
                  <td class="py-2">{item.price}</td>
                  <td class="py-2">
                    <input
                      type="number"
                      class="border w-12 text-center"
                      value={item.quantity}
                    />
                  </td>
                  <td class="py-2">{item.total}</td>
                </tr>
                
              ))}
            </tbody>
          </table>
          <div class="flex justify-between mt-4">
            <button class="bg-red-600 text-white py-2 px-4 rounded">
              Update Cart
            </button>
            <button class="bg-red-600 text-white py-2 px-4 rounded">
              Clear Cart
            </button>
          </div>
        </div>
        <div class="w-1/3 pl-8">
          <div class="bg-gray-100 p-4 rounded mb-4">
            <h2 class="text-blue-900 font-bold mb-2">Cart Totals</h2>
            <div class="flex justify-between mb-2">
              <span>Subtotals:</span>
              <span>£{subTotal}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>Totals:</span>
              <span>£{total}</span>
            </div>
            <div class="text-green-600 text-sm mb-2">
              Shipping & taxes calculated at checkout
            </div>
            <button class="bg-green-600 text-white py-2 px-4 rounded w-full">
              Proceed To Checkout
            </button>
          </div>
          <div class="bg-gray-100 p-4 rounded">
            <h2 class="text-blue-900 font-bold mb-2">Calculate Shopping</h2>
            <input
              type="text"
              placeholder="Bangladesh"
              class="border w-full p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Mirpur Dhaka - 1200"
              class="border w-full p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Postal Code"
              class="border w-full p-2 mb-2"
            />
            <button class="bg-red-600 text-white py-2 px-4 rounded w-full">
              Calculate Shipping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
