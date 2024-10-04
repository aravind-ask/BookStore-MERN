import React from 'react'

export default function Home() {
  return (
    <div>
      home
    </div>
  )
}


// import React from "react";
// import { Link } from "react-router-dom";
// import {
//   Avatar,
//   Button,
//   Card,
//   Container,
//   Flex,
//   Grid,
//   Image,
//   Text,
// } from "flowbite-react";
// import { useState, useEffect } from "react";
// import axios from "axios";

// const Home = () => {
//   const [books, setBooks] = useState([]);

//   useEffect(() => {
//     axios
//       .get("/api/books")
//       .then((response) => {
//         setBooks(response.data);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }, []);

//   const latestBooks = books.filter((book) => book.status === "latest");
//   const trendingBooks = books.filter((book) => book.status === "trending");

//   return (
//     <Container className="mx-auto p-4">
//       <Flex className="justify-center items-center h-screen">
//         <div className="w-full h-1/2 flex justify-center items-center">
//           <h1 className="text-4xl font-bold text-center">Welcome to ReBook</h1>
//           <Button gradientDuoTone="purpleToPink" className="mt-4">
//             <Link to="/books">Buy Book</Link>
//           </Button>
//         </div>
//         <div className="w-full h-1/2">
//           <h2 className="text-2xl font-bold text-center">Latest Books</h2>
//           <Grid className="grid-cols-3 gap-4">
//             {latestBooks.map((book) => (
//               <Link to={`/books/${book._id}`} key={book._id}>
//                 <Card className="bg-white rounded-lg shadow-md">
//                   <Image src={book.image} alt={book.title} />
//                   <Text className="text-lg">{book.title}</Text>
//                   <Text className="text-sm">{book.author}</Text>
//                 </Card>
//               </Link>
//             ))}
//           </Grid>
//         </div>
//         <div className="w-full h-1/2">
//           <h2 className="text-2xl font-bold text-center">Trending Books</h2>
//           <Grid className="grid-cols-3 gap-4">
//             {trendingBooks.map((book) => (
//               <Link to={`/books/${book._id}`} key={book._id}>
//                 <Card className="bg-white rounded-lg shadow-md">
//                   <Image src={book.image} alt={book.title} />
//                   <Text className="text-lg">{book.title}</Text>
//                   <Text className="text-sm">{book.author}</Text>
//                 </Card>
//               </Link>
//             ))}
//           </Grid>
//         </div>
//       </Flex>
//     </Container>
//   );
// };

// export default Home;
