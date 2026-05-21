# 📌 Members Only

A full-stack message board application built with **Node.js, Express, PostgreSQL, Passport.js, and EJS**, where users can post messages anonymously unless they are members or admins. [Live link]().

---

## 🔐 Overview

Members Only is a role-based clubhouse app where users can create posts, but only privileged users can see full details and manage content.

- Guests can view posts anonymously  
- Members can view authors and timestamps  
- Admins can delete posts  

---

## 🚀 Features

- User authentication with Passport.js  
- Secure password hashing with bcrypt  
- Membership system via secret phrase  
- Admin role system via secret phrase  
- Create and view posts  
- Conditional UI based on user role  
- Members page showing all users  
- Admin-only post management  

---

## 🧱 Tech Stack

- Node.js  
- Express.js  
- PostgreSQL  
- EJS  
- Passport.js  
- bcryptjs  
- express-validator  
- express-session + connect-pg-simple  
- Vanilla CSS (mobile-first)  

---

## 🗄️ Database

- **Users**: stores account info, membership status, admin role  
- **Posts**: stores messages linked to users  
- **Sessions**: managed via PostgreSQL session store  

---

## 🔐 Roles

- **Guest** → view posts only  
- **Member** → see authors + timestamps  
- **Admin** → delete posts + full access  

---

## 📌 Core Routes

- `/` – Home feed  
- `/sign-up`, `/sign-in`, `/sign-out` – Authentication  
- `/membership` – Become a member  
- `/admin` – Become admin  
- `/new-post` – Create post  
- `/members` – View users  
- `/manage-posts` – Admin dashboard  

---

## 🌱 What I Learned

- Authentication & session management  
- Role-based authorization  
- PostgreSQL relational design  
- MVC structure in Express  
- Secure password handling  
- Conditional rendering with EJS  

---

## ⚙️ Setup
Only run the commands below after creating a PostgreSQL database and creating connections meaningful to your configuration.

```bash
npm install
node app.js
```