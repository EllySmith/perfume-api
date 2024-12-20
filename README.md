
# Perfume Collection API 
[![Maintainability](https://api.codeclimate.com/v1/badges/12f28b0b29510dc80a1b/maintainability)](https://codeclimate.com/github/EllySmith/perfume-api/maintainability)    [![Run Tests](https://github.com/EllySmith/perfume-api/actions/workflows/ci.yaml/badge.svg)](https://github.com/EllySmith/perfume-api/actions/workflows/ci.yaml)


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
- Puppeteer

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
### **POST** Endpoint: /api/search 

Adds a new perfume to the collection retreiving data automatically from fragrantica search:

```json
{ "searchString": "chanel 5 eau toilette" }
```
(not perfect yet, opens browser on the background to avoid security check and can make mistakes if the query is not precise)

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