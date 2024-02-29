require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./DBconnect");
const allApiRoutes = require("./routes/allApiRoutes.routes");

const port = process.env.PORT || 8000;

app.use(express.json({ limit: "1000kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
app.use(cookieParser());

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, "build")));

app.use("/api", allApiRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// app.get("/", (req, res) => {
//   res.setHeader("Content-Type", "text/html");
//   res.status(200);
//   // res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// app.use("/api/users", userRouter);

// app.get("*", (req, res) => {
//   res.status(404);
//   res.json({
//     status: 404,
//     message: "Not Found"
//   });
// });

connectDB()
  .then(() => {
    app.listen(port, (req, res) => {
      console.log("listening on port", port);
    });
  })
  .catch(err => {
    console.log("error in server listening on port", err);
  });

/* before */
// const express = require("express");
// const fs = require("fs");

// const server = express();
// const port = 8000;

// const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
// const products = data.products;

// server.get("/prod/:id", (req, res) => {
//   const id = req.params.id;
//   const product = products.find(p => p.id == id);
//   res.send(product);
// });

// server.listen(port, () => {
//   console.log("listening on " + port);
// });

/*Node */

// const http = require("http");
// const fs = require("fs");
// const https = require("https");

// const doc = fs.readFileSync("index.html", "utf8");
// // const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
// // const products = data.products;

// let data = {};
// const fetchData = () => {
//   https.get("https://dummyjson.com/products", apiRes => {
//     let apiData = "";

//     // Concatenate chunks of data
//     apiRes.on("data", chunk => {
//       apiData += chunk;
//     });

//     // Parse the JSON data when the response is complete
//     apiRes.on("end", () => {
//       data = JSON.parse(apiData);
//       // console.log("Data fetched from API:", data);
//     });
//   });
// };

// // Fetch data when the server starts
// fetchData();

// const server = http.createServer((req, res) => {
//   console.log(req.url);

//   switch (req.url) {
//     case "/":
//       res.end("from /");
//       break;
//     case "/doc":
//       res.end(doc);
//       break;
//     // case "/data":
//     //   res.setHeader("Content-Type", "text/html");
//     //   const allProductsHTML = products
//     //     .map(product => {
//     //       let productHTML = doc
//     //         .replace("imgurl", product.thumbnail)
//     //         .replace("title", product.title)
//     //         .replace("price", product.price)
//     //         .replace("rating", product.rating);
//     //       return productHTML;
//     //     })
//     //     .join("");
//     //   res.end(allProductsHTML);
//     //   break;
//     case "/data":
//       res.setHeader("Content-Type", "text/html");
//       const products = data.products || [];
//       const allProductsHTML = products
//         .map(product => {
//           let productHTML = doc
//             .replace("imgurl", product.thumbnail)
//             .replace("title", product.title)
//             .replace("price", product.price)
//             .replace("rating", product.rating);

//           return productHTML;
//         })
//         .join("");
//       res.end(allProductsHTML);
//       break;
//     default:
//       if (req.url.startsWith("/data")) {
//         const url = req.url.split("/")[2];
//         const products = data.products || [];
//         const prd = products.find(p => p.id === +url);
//         console.log(prd);

//         if (prd) {
//           res.setHeader("Content-Type", "text/html");
//           const modiftData = doc
//             .replace("title", prd.title)
//             .replace("price", prd.price)
//             .replace("rating", prd.rating)
//             .replace("imgurl", prd.thumbnail);
//           res.end(modiftData);
//         } else {
//           res.writeHead(404);
//           res.end();
//           return;
//         }
//         return;
//       }
//       res.writeHead(404);
//       res.end();
//       break;
//   }

//   console.log("server function satrted.");
// });

// server.listen(8000);

// console.log("helll");
