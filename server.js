/********************************************************************************
 *  WEB422 – Assignment 1
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Vishavjeet Khatri    Student ID: 150215234             Date: May-25-2025
 *
 *  Published URL: https://your-vercel-deployment.vercel.app
 ********************************************************************************/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ListingsDB = require('./modules/listingsDB'); // class export
const db = new ListingsDB(); // instantiate

const app = express();
app.use(cors());
app.use(express.json());

const HTTP_PORT = process.env.PORT || 3000;
const CONN_STRING = process.env.MONGODB_CONN_STRING;

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API Listening' });
});

// Initialize DB then start server
db.initialize(CONN_STRING)
  .then(() => {
    console.log(' You are sucessfully connected to MongoDb Atlas')

    // POST /api/listings
    app.post('/api/listings', async (req, res) => {
      try {
        const created = await db.addNewListing(req.body);
        res.status(201).json(created);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // GET /api/listings
    app.get('/api/listings', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const name = req.query.name;

      try {
        const listings = await db.getAllListings(page, perPage, name);
        res.json(listings);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // GET /api/listings/:id
    app.get('/api/listings/:id', async (req, res) => {
      try {
        const item = await db.getListingById(req.params.id);
        if (item) res.json(item);
        else res.sendStatus(404);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // PUT /api/listings/:id
    app.put('/api/listings/:id', async (req, res) => {
      try {
        const result = await db.updateListingById(req.body, req.params.id);
        if (result && result.modifiedCount > 0) {
          const updated = await db.getListingById(req.params.id);
          res.json(updated);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // DELETE /api/listings/:id
    app.delete('/api/listings/:id', async (req, res) => {
      try {
        const result = await db.deleteListingById(req.params.id);
        if (result && result.deletedCount > 0) {
          res.sendStatus(204);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.listen(HTTP_PORT, () => {
      console.log(` Server is listiening on port ${HTTP_PORT}`);
    });
  })
  .catch(err => {
    console.error(' Failed to initialize DB:', err);
  });
