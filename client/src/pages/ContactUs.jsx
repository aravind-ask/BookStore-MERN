import { Button, Card, Label, TextInput, Textarea } from "flowbite-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pt-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Contact Us
      </h1>

      <Card className="shadow-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Field */}
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Your Name
            </Label>
            <TextInput
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required={true}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="mb-2 block">
              Your Email
            </Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required={true}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Message Field */}
          <div>
            <Label htmlFor="message" className="mb-2 block">
              Your Message
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Write your message here..."
              required={true}
              rows={5}
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
            Send Message
          </Button>
        </form>
      </Card>
    </div>
  );
}
