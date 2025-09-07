# Scribly

A clean and modern blogging platform inspired by [Medium](https://medium.com), built with React and Vite.

## 1. Demo

Check out the live demo: [scribly-blog.netlify.app](https://scribly-blog.netlify.app)

## 2. Features

1. Fast and efficient front-end using **React & Vite**  
2. Built-in Hot Module Replacement (HMR) for dynamic development  
3. Integrated **ESLint** configuration for code quality  
4. Utility-first styling powered by **Tailwind CSS**  
5. Clean, maintainable file structure for easy scalability  

## 3. Tech Stack

1. **React** — UI library  
2. **Vite** — super-fast build tool with HMR  
3. **Firebase** — authentication & backend services  
4. **ESLint** — linting and code formatting  
5. **Tailwind CSS** — styling framework  
6. **PostCSS** — CSS transformations  
7. **JavaScript, HTML, CSS** — core technologies  

## 4. Getting Started (Development)

1. **Clone the repository**  
   ```bash
   git clone https://github.com/anjali-rayy/Scribly.git
   cd Scribly

Install dependencies

npm install


Start development server

npm run dev


This launches the app with hot-reloading for real-time updates.

5. Project Structure
Scribly/
├── public/                        
├── src/
│   ├── assets/                    
│   │   └── (all static resources)
│   │
│   ├── components/                
│   │   ├── Auth/                  
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── Blog/                  
│   │   │   ├── BlogEditor.jsx
│   │   │   └── BlogPreview.jsx
│   │   │
│   │   ├── Common/                
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── Posts/
│   │   │       ├── Recommended.jsx
│   │   │       └── Trending.jsx
│   │   │
│   │   ├── Home/                  
│   │   │   ├── HeroSection.jsx
│   │   │   ├── UserToFollow.jsx
│   │   │   └── FollowBtn.jsx
│   │   │
│   │   ├── Profile/               
│   │   │   ├── EditProfile.jsx
│   │   │   └── ProfileHeader.jsx
│   │   │
│   │   └── index.js               
│   │
│   ├── Context/                   
│   │   ├── AuthContext.jsx
│   │   ├── BlogContext.jsx
│   │   └── index.js
│   │
│   ├── firebase/                  
│   │   └── firebase.js
│   │
│   ├── pages/                     
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Profile.jsx
│   │   └── NotFound.jsx
│   │
│   ├── styles/                    
│   │   └── globals.css
│   │
│   ├── App.jsx                    
│   ├── main.jsx                   
│   └── index.css                  
│
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js

6. Configuration & Linting

ESLint rules in eslint.config.js keep code consistent

Tailwind setup in tailwind.config.js

PostCSS setup in postcss.config.js

Firebase initialized in firebase.js

Vite handles build and dev server (vite.config.js)

7. Contributing

Fixing bugs 🐛

Adding new features (Markdown support, comments, dark mode) ✨

Improving UI/UX 🎨

Enhancing documentation 📖

8. License

This project is licensed under the MIT License. See the LICENSE
 file for details.