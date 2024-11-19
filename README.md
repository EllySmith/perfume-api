# Perfume Collection API

### This is a Node.js & Express-based REST API for managing a collection of perfumes using a MongoDB database. The API allows you to perform CRUD (Create, Read, Update, Delete) operations on perfume records, compare scennts, search for notes and parse data from Fragrantica.com.

### Features

Add new perfumes with detailed notes.
Retrieve all perfumes or specific ones by ID.
Update existing perfume records.
Delete perfumes from the collection.
Parse fragrannce data from Fragrantica portal.
Compare fragrance compositions. 
Search for notes. 

### 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- Puppeteer (for scraping, if applicable)

## 📡 API Endpoints

### **POST** Endpoint: /api/perfumes

Adds a new perfume to the collection in this format:

```json
{
  "name": "Name",
  "brand": "Brand",
  "fragranceNotes": ["note", "note2"],
  "volume": number,
  "price": number,
  "createdAt": { "default": "Date.now" }
}
```

### **POST** Endpoint: /api/scrape 

Adds a new perfume to the collection retreiving data automatically from a give fragrantica.com link:

```json
{ "url": "fragranntica.com/link" }
```

### **POST** Endpoint: /api/findByNote 

Serachs and gives back the names of perfumes cotaining certain notes:

```json
{ "notes": ["note", "note2"] }
```

### **GET** Endpoint: /api/perfumes

Description: Retrieves a list of all perfumes.


### **GET** Endpoint: /api/perfumes/:id

Description: Retrieves a perfume by its ID.

### **DELETE** Endpoint: /api/perfumes/:id

Description: Deletes a perfume by its ID.