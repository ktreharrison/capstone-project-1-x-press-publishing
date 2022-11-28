const errorhandler = require('errorhandler');
const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const artistsRouter = express.Router();


artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1',
     (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    })
}) // /artist

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get("SELECT * FROM Artist WHERE Artist.id == $artistId",
    {$artistId:artistId}, 
    (err, artist) => {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist
            next();
        } else {
            return res.sendStatus(404);
        }
    })
})

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
})

artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dob =  req.body.artist.dateOfBirth;
    const bio = req.body.artist.biography;
    const isEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dob || !bio) {
        return res.sendStatus(400);
    } 

    const sql = "INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dob, $bio, $isEmployed)";
    const values = {
            $name: name,
            $dob: dob,
            $bio: bio,
            $isEmployed: isEmployed
        };

    db.run(sql, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
                (err, artist) => {
                    res.status(201).json({artist : artist});
                });
            }
        });
});

artistsRouter.put('/:artistId', (req, res, next) => {
    const id = req.params.artistId
    const name = req.body.artist.name;
    const dob =  req.body.artist.dateOfBirth;
    const bio = req.body.artist.biography;
    const isEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dob || !bio) {
        return res.sendStatus(400);
    };

    const sql = 'UPDATE Artist SET name=$name, date_of_birth=$dob, biography=$bio, is_currently_employed=$isEmployed WHERE Artist.id =$id'
    const values = {
            $id: id,
            $name: name,
            $dob: dob,
            $bio: bio,
            $isEmployed: isEmployed
        };
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${id}`, (err, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    }); 
});


artistsRouter.delete('/:artistId', (req, res, next) => {
    const sql = `UPDATE Artist SET is_currently_employed=0 WHERE ${req.params.artistId}`
    db.run(sql, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id=${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist: artist});
            });
            
        };
    });
});

module.exports = artistsRouter;