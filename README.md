# Wildt
**WILDTHREAD – Wear the Noise.**  WILDTHREAD is a modern streetwear e-commerce website designed for fashion enthusiasts who want to express their individuality through bold, urban-inspired styles. It features a curated collection of oversized T-shirts, hoodies, jeans, cargos, and accessories, combined with an interactive shopping experience.
![image alt](https://github.com/asvinsam/Wildt/blob/main/Screenshot%202026-11-09%20141042.png?raw=true)
# WILDTHREAD — Wear the Noise. ⚡

### A Modern Streetwear E-Commerce Experience

**WILDTHREAD** is a modern, responsive streetwear e-commerce website designed to bring fashion, individuality and technology together through an immersive online shopping experience.

Built with HTML5, CSS3 and Vanilla JavaScript, WILDTHREAD delivers a bold, interactive and user-friendly storefront inspired by contemporary urban fashion. The platform features a curated collection of streetwear products, dynamic product listings, category-based browsing, shopping cart functionality, wishlists and interactive product previews.

The project focuses on creating an engaging shopping experience with a distinctive visual identity, responsive layouts and practical e-commerce functionality.

> **Wear the noise. Leave a little static.**

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Project Objectives](#-project-objectives)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [Project Architecture](#-project-architecture)
6. [Website Sections](#-website-sections)
7. [Product Management System](#-product-management-system)
8. [Shopping Cart and Wishlist](#-shopping-cart-and-wishlist)
9. [User Interface and Design](#-user-interface-and-design)
10. [Installation and Setup](#-installation-and-setup)
11. [Deployment on Vercel](#-deployment-on-vercel)
12. [Project Functionality](#-project-functionality)
13. [Future Enhancements](#-future-enhancements)
14. [Learning Outcomes](#-learning-outcomes)
15. [Contributing](#-contributing)
16. [License](#-license)

---

## 🛍️ Project Overview

WILDTHREAD is a front-end e-commerce project developed around the concept of a contemporary streetwear fashion brand.

The website provides customers with an online platform where they can explore different clothing collections, discover new arrivals, view product information, save their favourite items and manage their shopping bags.

Unlike conventional template-based shopping websites, WILDTHREAD uses a distinctive dark-themed interface with bold typography, neon-inspired highlights, animated elements and editorial-style photography to create a memorable brand experience.

The application is developed using native web technologies without relying on large front-end frameworks. This makes the project lightweight, easy to maintain and suitable for further customization.

**Project Information**

| Attribute | Details |
|---|---|
| Project Name | WILDTHREAD |
| Project Type | E-Commerce Website |
| Industry | Fashion and Streetwear |
| Website Category | Online Clothing Store |
| Frontend | HTML5, CSS3, JavaScript |
| Product Data | JSON |
| Client-Side Storage | Browser LocalStorage |
| Development Server | Node.js |
| Deployment Platform | Vercel |
| Architecture | Frontend-focused, no-build application |

---

## 🎯 Project Objectives

The primary objective of WILDTHREAD is to develop a visually engaging and functional e-commerce storefront that demonstrates modern frontend development concepts.

The major objectives include:

- Develop a fully responsive online streetwear shopping experience.
- Create an attractive and recognizable fashion brand identity.
- Implement dynamic product rendering using JSON-based product data.
- Provide category-based product browsing and filtering.
- Develop interactive shopping cart and wishlist functionality.
- Implement product search, sorting and quick-view functionality.
- Improve user experience through animations, transitions and interactive components.
- Maintain a structured, reusable and easy-to-understand codebase.
- Deploy the website online using a modern hosting platform.

---

## ✨ Key Features

### 1. Dynamic Product Catalogue

The website displays products dynamically using structured JSON data instead of manually writing individual product cards in HTML.

Features include:

- Dynamic product rendering.
- Product names and descriptions.
- Product pricing and original pricing.
- Discount percentage calculation.
- Product colour variations.
- Product image galleries.
- Product category information.
- Availability and stock information.
- Product tags such as New and Bestseller.

### 2. Product Search

Users can search for products using keywords.

The search functionality helps customers find products based on product names, categories and associated tags.

### 3. Category-Based Filtering

Products can be explored through different clothing categories, making browsing more convenient.

Available collections include:

- T-Shirts
- Hoodies
- Jeans
- Joggers
- Cargos
- Accessories

### 4. Product Sorting

Customers can organize products using available sorting options:

- Featured products.
- Price: Low to High.
- Newest First.

### 5. Shopping Cart

The shopping cart allows customers to manage selected products before proceeding to checkout.

Features include:

- Add products to cart.
- Remove products from cart.
- Increase or decrease product quantities.
- Select product sizes.
- Calculate subtotal dynamically.
- Display cart item count.
- Track progress towards free shipping.
- Preserve cart information using LocalStorage.

### 6. Wishlist

Customers can save products they are interested in purchasing later.

Features include:

- Add products to wishlist.
- Remove saved products.
- Display wishlist item count.
- Browse saved products through the wishlist collection.
- Preserve wishlist information using LocalStorage.

### 7. Quick View

The quick-view feature allows customers to inspect a product without navigating away from the main shopping page.

It provides an interactive product preview with relevant product information and purchasing options.

### 8. Lookbook and Image Gallery

The lookbook section showcases fashion photography and styling inspiration.

Features include:

- Editorial-style image layouts.
- Interactive image previews.
- Lightbox functionality.
- Previous and next image navigation.

### 9. Newsletter Subscription

The website includes a newsletter section where visitors can enter their email addresses to express interest in receiving updates about new collections and offers.

The frontend validates email input and provides feedback to the visitor. A local demo endpoint is also included as an optional starting point for storing newsletter submissions.

### 10. Additional Interactive Features

- Animated announcement ticker.
- Countdown timer for upcoming drops.
- Customer testimonials.
- Instagram-inspired community gallery.
- Responsive mobile navigation.
- Toast notifications.
- Back-to-top functionality.
- Interactive shopping cart drawer.

---

## 💻 Technology Stack

WILDTHREAD is built using lightweight and widely used web technologies.

| Technology | Purpose |
|---|---|
| HTML5 | Website structure and semantic content |
| CSS3 | Styling, layouts, animations and responsive design |
| Vanilla JavaScript | Dynamic rendering and interactive functionality |
| JSON | Structured product catalogue |
| LocalStorage | Client-side cart and wishlist persistence |
| Node.js | Optional local static server and demo newsletter endpoint |
| Git | Version control |
| GitHub | Source code hosting |
| Vercel | Website deployment and hosting |

### Why Vanilla JavaScript?

Vanilla JavaScript was selected to implement the core application functionality without introducing unnecessary framework dependencies.

It is responsible for:

- Fetching product information from JSON.
- Generating product cards dynamically.
- Handling search and filtering.
- Managing shopping cart operations.
- Updating wishlist information.
- Handling modal and drawer interactions.
- Updating interface elements based on user actions.

This approach keeps the application lightweight while demonstrating fundamental JavaScript concepts.

---

## 📂 Project Architecture

The project follows a modular folder structure that separates website content, styling, application logic and product information.

```text
WILDTHREAD/
│
├── index.html
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── products.js
│   ├── cart.js
│   └── main.js
│
├── data/
│   ├── products.json
│   └── newsletter.json
│
├── assets/
│   ├── images/
│   ├── products/
│   └── icons/
│
├── server.js
├── README.md
└── .gitignore
```

### Folder Description

| File / Directory | Responsibility |
|---|---|
| `index.html` | Main website structure and content |
| `css/style.css` | Main visual styling and design system |
| `css/responsive.css` | Responsive layouts for different screen sizes |
| `js/products.js` | Product loading, rendering, filtering and sorting |
| `js/cart.js` | Shopping cart, wishlist and related interactions |
| `js/main.js` | Navigation, countdown, newsletter and general UI interactions |
| `data/products.json` | Product catalogue and product information |
| `data/newsletter.json` | Local demo storage for newsletter submissions |
| `assets/images/` | Website photography and visual assets |
| `assets/products/` | Product-specific images |
| `assets/icons/` | Icons and additional visual resources |
| `server.js` | Optional Node.js development server and demo newsletter endpoint |

---

## 🧥 Website Sections

The website is organized into several sections to create a complete storefront experience.

| Section | Description |
|---|---|
| Announcement Bar | Highlights promotions, new drops and shipping information |
| Navigation Header | Provides access to the main website sections, search, wishlist and cart |
| Hero Section | Introduces the WILDTHREAD brand and its visual identity |
| Brand Marquee | Displays animated brand-related messaging |
| Shop by Category | Allows customers to browse different clothing collections |
| New Arrivals | Displays dynamically loaded products |
| Limited Drop Banner | Promotes upcoming collections with a countdown |
| Lookbook | Displays fashion photography and styling inspiration |
| About / Why WILDTHREAD | Highlights brand identity and shopping benefits |
| Customer Reviews | Displays sample customer testimonials |
| Community Gallery | Showcases streetwear-inspired imagery |
| Newsletter | Allows visitors to submit their email addresses |
| Footer | Provides navigation links and additional brand information |

---

## 📦 Product Management System

One of the main technical components of WILDTHREAD is its JSON-based product management system.

Instead of hardcoding product information into HTML, the website stores product data in a separate JSON file.

This makes it easier to add, remove and modify products without changing the main website structure.

### Example Product Structure

```json
{
  "id": "wt-t01",
  "name": "Static Noise Oversized Tee",
  "slug": "static-noise-oversized-tee-white",
  "category": "t-shirts",
  "type": "t-shirt",
  "price": 899,
  "mrp": 1099,
  "colors": [
    {
      "name": "White",
      "hex": "#f4f1ea"
    }
  ],
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "stock": {
    "S": 2,
    "M": 0,
    "L": 0,
    "XL": 15,
    "XXL": 5
  },
  "images": [
    "assets/products/tee-white.jpg",
    "assets/products/tee-white-2.jpg"
  ],
  "description": "Our heaviest blank, cut boxy and long.",
  "tags": ["bestseller"],
  "createdAt": "2026-09-28"
}
```

### How Product Loading Works

1. The website requests product information from `data/products.json`.
2. JavaScript retrieves the JSON response using the Fetch API.
3. The response is converted into JavaScript objects.
4. Product information is processed and rendered dynamically.
5. Customers can interact with the displayed products through search, filtering, sorting and quick view.

This approach provides a clear separation between product information and the website interface.

---

## 🛒 Shopping Cart and Wishlist Architecture

WILDTHREAD uses browser LocalStorage to preserve cart and wishlist information.

LocalStorage allows information to remain available even after the customer refreshes or closes the browser.

### Shopping Cart Workflow

```text
Customer selects a product
          |
          v
Customer chooses size
          |
          v
Product added to cart
          |
          v
Cart information updated
          |
          v
Subtotal and item count recalculated
          |
          v
Information saved in LocalStorage
          |
          v
Cart restored when website is reopened
```

### Wishlist Workflow

```text
Customer selects wishlist icon
          |
          v
Product ID added to wishlist
          |
          v
Wishlist count updated
          |
          v
Information saved in LocalStorage
          |
          v
Saved products displayed in wishlist tab
```

**Note:** LocalStorage provides browser-side persistence. It does not synchronize shopping carts between different devices or users and should not be treated as a secure inventory or order-management database.

---

## 🎨 User Interface and Design

The visual identity of WILDTHREAD is inspired by modern streetwear brands, urban fashion culture and contemporary editorial websites.

The design prioritizes strong typography, high-contrast visuals and engaging interactions.

### Design Characteristics

- Dark-themed interface.
- Neon-inspired accent colours.
- Bold display typography.
- Large editorial-style images.
- Animated text marquees.
- Interactive hover effects.
- Smooth transitions and scrolling.
- Responsive product grids.
- Modern card layouts.
- Mobile-friendly navigation.

### User Experience Principles

The website is designed around three major principles:

**1. Visual Identity**

Create a recognizable streetwear brand through distinctive typography, photography and colour combinations.

**2. Ease of Navigation**

Allow visitors to discover products through categories, search, filters and sorting options.

**3. Interactive Shopping**

Provide practical shopping interactions through quick view, wishlist and cart functionality.

---

## ⚙️ Installation and Setup

Follow these instructions to run WILDTHREAD locally.

### Prerequisites

Install the following software:

| Requirement | Purpose |
|---|---|
| Node.js | Run the optional local development server |
| Visual Studio Code | Code editing and project development |
| Web Browser | Access and test the website |
| Git | Version control and GitHub integration |

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/wildthread.git
```

### Step 2: Navigate to the Project

```bash
cd wildthread
```

### Step 3: Start the Local Server

```bash
node server.js
```

No additional npm packages are required for the supplied static server.

### Step 4: Open the Website

Visit:

```text
http://localhost:3000
```

The website should now be accessible locally.

**Important:** Running the website through a local server is recommended because browsers may block JSON Fetch requests when `index.html` is opened directly using the `file://` protocol.

---

## 🚀 Deployment on Vercel

WILDTHREAD can be deployed using Vercel, which provides hosting for static websites and automatic deployment through GitHub.

### Deployment Process

1. Upload the project to a GitHub repository.
2. Create or sign in to a Vercel account.
3. Select **Add New Project**.
4. Import the WILDTHREAD GitHub repository.
5. Select **Other** as the framework preset.
6. Leave the build command empty.
7. Set the output directory to the project root (`./`).
8. Click **Deploy**.

After successful deployment, Vercel generates a public website URL.

Example:

```text
https://wildthread.vercel.app
```

### Continuous Deployment

When the GitHub repository is connected to Vercel, updates pushed to the configured production branch can automatically trigger a new deployment.

This simplifies website maintenance and makes publishing improvements easier.

---

## 🔍 Project Functionality and Testing

The following areas should be tested to ensure the website operates correctly.

| Test Area | Expected Result |
|---|---|
| Homepage | All main sections load correctly |
| Product Catalogue | Products are fetched and displayed |
| Product Images | Images load from the specified paths |
| Search | Matching products are displayed |
| Category Filtering | Products are filtered by category |
| Sorting | Products are arranged according to the selected option |
| Quick View | Product information appears in a modal |
| Shopping Cart | Products can be added, updated and removed |
| Wishlist | Products can be saved and removed |
| LocalStorage | Cart and wishlist persist after refreshing |
| Newsletter | Email validation and submission feedback work |
| Responsive Design | Website adapts to desktop, tablet and mobile |
| Vercel Deployment | Website and JSON resources load correctly |

---

## 🔮 Future Enhancements

WILDTHREAD currently focuses on the frontend shopping experience. Several enhancements can be introduced to transform it into a more complete e-commerce platform.

### 1. Backend Integration

- Develop a dedicated backend using Node.js and Express.js.
- Introduce REST APIs for product and order management.
- Implement server-side validation.
- Add centralized inventory management.

### 2. Database Integration

- Integrate MongoDB or MySQL.
- Store customer information and product details.
- Maintain order history.
- Synchronize inventory across users.

### 3. Authentication and Authorization

- Customer registration and login.
- Secure password handling.
- User profile management.
- Admin and customer roles.

### 4. Payment Gateway Integration

- Integrate a payment provider such as Razorpay.
- Support UPI, cards and other available payment methods.
- Implement secure order confirmation.
- Generate order receipts.

### 5. Admin Dashboard

- Add new products.
- Update product details and prices.
- Manage stock availability.
- View and manage customer orders.
- Monitor sales and product performance.

### 6. Advanced Customer Experience

- Product reviews and ratings.
- Personalized product recommendations.
- Recently viewed products.
- Advanced product filters.
- Order tracking.
- Automated email notifications.

### 7. Performance and Security

- Image optimization and lazy loading.
- Improved SEO.
- Secure API endpoints.
- Server-side input validation.
- Rate limiting and secure authentication.
- Accessibility improvements.

---

## 📚 Learning Outcomes

Developing WILDTHREAD provides practical experience in several important areas of web development.

The project demonstrates:

- Semantic HTML5 development.
- Advanced CSS styling and responsive layouts.
- JavaScript DOM manipulation.
- Asynchronous JavaScript and the Fetch API.
- JSON data handling.
- Dynamic content rendering.
- Event handling and event delegation.
- Browser LocalStorage.
- Search, filtering and sorting algorithms.
- Modular frontend architecture.
- Node.js server fundamentals.
- Git and GitHub version control.
- Static website deployment using Vercel.

It also demonstrates how a collection of frontend technologies can be combined to develop an interactive and visually engaging commercial-style website.

---

## 🤝 Contributing

Contributions, suggestions and improvements are welcome.

To contribute:

1. Fork this repository.
2. Create a new feature branch.
3. Implement your changes.
4. Commit your updates.
5. Submit a pull request.

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

---

## 📄 License

This project is developed for learning, demonstration and portfolio purposes.

If you intend to reuse or distribute the project, add an appropriate open-source license and ensure that all images, fonts and other third-party assets are properly licensed.

---

## 👨‍💻 Author

**WILDTHREAD — Wear the Noise.**

A streetwear e-commerce website developed to demonstrate modern frontend development, responsive design and interactive shopping functionality.

**Built with passion for fashion, design and technology.**

⭐ If you like this project, consider giving the repository a star on GitHub!

---

<p align="center">
  <strong>WILDTHREAD © 2026 — ALL NOISE RESERVED.</strong><br>
  <em>Wear the noise. Leave a little static.</em>
</p>
