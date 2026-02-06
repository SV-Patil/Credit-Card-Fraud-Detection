# 💳 Credit Card Fraud Detection

A machine learning–based web application to detect potentially fraudulent credit card transactions.  
The project combines a trained ML model with a FastAPI backend and a simple HTML/CSS/JavaScript frontend.

---

## 🚀 Features
- Predicts whether a transaction is **fraudulent or legitimate**
- FastAPI backend for model inference
- Clean web UI for user input
- Trained using real-world transaction features
- Supports categorical inputs via encoding

---

## 🛠 Tech Stack
- **Python**
- **Scikit-learn**
- **FastAPI**
- **HTML, CSS, JavaScript**
- **Joblib** (model persistence)

---

## 📂 Project Structure
- model.ipynb (Data loading, preprocessing, training)  
- fraud_model.pkl (Trained ML model)
- main.py (FastAPI application)
- templates/
  - index.html
- static/
  - style.css
  - index.js
- README.md

---

## ▶️ How to Run
1. Install dependencies  
pip install -r requirements.txt
2. Start the server  
uvicorn main:app --reload
3. Open in browser  
http://127.0.0.1:8000

## 📌 Note

* The model was trained using encoded categorical features.
* User-friendly inputs are converted to numeric form in the backend before prediction.
