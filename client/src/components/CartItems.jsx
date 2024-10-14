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
            </div>
            <span className="ml-auto">
              {item.quantity} x ${item.price}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
