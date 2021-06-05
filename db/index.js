//
// Common database functionality
//
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const simplyAuthHeader = 'Basic ' + Buffer.from('simplyrets:simplyrets', 'binary').toString('base64');
let client, mongo, users, properties = null;

module.exports = {
    // open
    //
    // opens a connection to the database and relevant collections.
    open: async () => {
        return new Promise((resolve, reject) => {
            if (!mongo) {
                MongoClient.connect('mongodb://127.0.0.1:27017/properties?', function(err, connection) {
                    if (err) {
                        reject(err);
                    }
                    client = connection;
                    mongo = client.db('properties');
                    if (mongo) {
                        users = mongo.collection('users');
                        properties = mongo.collection('properties');
                    }
                    resolve({ client, mongo, users, properties });
                });   
            }    
        });
    },
    // close
    //
    // closes the connection to the database and releases all collections.
    close: async () => {
        if (client) {
            await client.close();
            client = mongo = users = properties = null;
            return { client, mongo, users, properties };
        }
    },
    // authenticate
    //
    // checks the provided request header for a valid bearer token, returns the client associated with a valid token.
    authenticate: async (req) => {
        if (mongo && users) {
            const header = req.headers.authorization;
            if (header) {
                const token = header.split(' ')[1];
                return await users.findOne({ token });
            }
        }
        return 'hello';
    },
    // listing
    //
    // attempts to retrieve a specific listing from the SimplyRets server. If the listing is returned it is decorated with our favoriteCounter value.
    listing: async mlsId => {
        let uri = 'https://api.simplyrets.com/properties/' + mlsId;
        let response = await fetch(uri, {
            headers: { Authorization: simplyAuthHeader }
        });
        let mlsListing = await response.json();
        if (mlsListing) {
            let listing = await properties.findOne({ mlsId });
            if (listing) {
                mlsListing.favoriteCount = listing.favoriteCount;
            }
        }
        return mlsListing;
    },
    // listings
    //
    // attempts to retrieve a all listings from the SimplyRets server for a specific city or all listings if city is not specified.
    listings: async city => {
        let uri = 'https://api.simplyrets.com/properties/?' + (city ? `q=${city}` : '');
        let response = await fetch(uri, {
            headers: { Authorization: simplyAuthHeader }
        });
        let mlsListings = await response.json();
        if (mlsListings && mlsListings.length > 0) {
            let mlsIds = mlsListings.map(listing => ''+listing.mlsId);
            let listings = await properties.find({ mlsId: { $in: mlsIds } }).toArray();
            mlsListings = mlsListings.map(mlsListing => {
                let listing = listings.find(listing => listing.mlsId == mlsListing.mlsId);
                if (listing) {
                    mlsListing.favoriteCount = listing.favoriteCount;
                } else {
                    mlsListing.favoriteCount = 0;
                }
                return mlsListing;
            });
        }
        return mlsListings;
    },
    // favoriteListing
    //
    // Increments the current favoriteCount for a specific listing and returns the listing.
    favoriteListing: async (mlsId, value) => {
        await properties.updateOne({ mlsId }, { $inc: { favoriteCount: value } }, { upsert: true });
        return module.exports.listing(mlsId);
    }
};
