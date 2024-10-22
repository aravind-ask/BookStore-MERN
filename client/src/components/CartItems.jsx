export const CartItems = ({ cartItems }) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Cart Items</h3>
      <ul>
        {cartItems.items.map((item, index) => (
          <li key={index} className="flex items-center mb-4">
            <img
              src={item.images}
              alt={item.title}
              className="w-20 h-20 object-cover mr-4"
            />
            <div>
              <h4 className="text-lg font-bold mb-1">{item.title}</h4>
              <p className="text-gray-600">{item.author}</p>
              <p className="text-gray-600">Quantity: {item.quantity}</p>{" "}
              {/* Displaying quantity */}
            </div>
            <span className="ml-auto">
              {/* Show discounted price if applicable */}
              {item.discountedPrice < item.price ? (
                <>
                  <span className="text-red-500 font-bold">
                    ₹{item.discountedPrice}
                  </span>
                  <span className="line-through text-gray-500 ml-2">
                    ₹{item.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span>₹{item.price.toFixed(2)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
