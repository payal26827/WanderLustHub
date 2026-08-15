# Wanderlust - Complete Express/MongoDB MVC Project

This is an original implementation of the features discussed:

- MVC architecture
- Listings CRUD
- Reviews CRUD
- Users: signup/login/logout
- Password hashing + salting with bcrypt
- Express Router
- Router `mergeParams`
- Validation with Joi
- Authentication and authorization
- Cookies
- Cookie parser
- Signed cookies
- Express sessions
- MongoDB session store
- Flash messages
- Listing image upload
- Cloudinary cloud storage
- Save image URL + filename in MongoDB
- Image preview
- Edit listing image
- Delete listing image from Cloudinary
- Mapbox geocoding
- GeoJSON coordinates
- Map marker + popup
- Category filters
- Price filters
- Search
- Tax switch
- GitHub-ready structure
- Render deployment configuration

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env` and fill:

```text
MONGO_URL=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAPBOX_TOKEN=
PORT=8080
```

## 3. Run

```bash
npm run dev
```

or

```bash
npm start
```

Open:

```text
http://localhost:8080
```

## 4. Project structure

```text
wanderlust-complete/
├── app.js
├── package.json
├── .env.example
├── controllers/
│   ├── listingController.js
│   ├── reviewController.js
│   ├── taxController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   ├── locals.js
│   └── validation.js
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── routes/
│   ├── cookieRoutes.js
│   ├── listingRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── ExpressError.js
│   ├── cloudinary.js
│   ├── geocode.js
│   ├── upload.js
│   └── wrapAsync.js
├── views/
│   ├── layouts/
│   ├── includes/
│   ├── listings/
│   ├── users/
│   └── error.ejs
└── public/
    ├── css/
    └── js/
```

## 5. Important security notes

- Never commit `.env`.
- Use a strong `SESSION_SECRET`.
- Keep Cloudinary API secret private.
- Keep database credentials private.
- For production, set `NODE_ENV=production`.
- Use HTTPS in production.

## 6. Render

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Add the same environment variables in Render's Environment Variables section.

## 7. GitHub

```bash
git init
git add .
git commit -m "Complete Wanderlust project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

Then connect the GitHub repository to Render.
