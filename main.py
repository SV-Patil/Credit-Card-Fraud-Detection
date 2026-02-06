from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import joblib
import numpy as np

# Load model and encoders
model = joblib.load('fraud_model.pkl')
feature_means = joblib.load('feature_means.pkl')
category_le = joblib.load('encoders/le_encoder_category.pkl')
city_le = joblib.load('encoders/le_encoder_city.pkl')
job_le = joblib.load('encoders/le_encoder_job.pkl')
gender_le = joblib.load('encoders/le_encoder_gender.pkl')

# Define input schema
class Transaction(BaseModel):
    category: str
    amt: float
    gender: str
    age: int
    city_pop: float
    city: str
    job: str
    hour: int
    Weekday: int
    month: int
    day: int

app = FastAPI(title="Credit Card Fraud Detection API")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/predict")
def predict(data: Transaction):
    # Convert user input to dictionary
    user_features = {
        'amt': data.amt,
        'city': data.city,
        'category': data.category,
        'job': data.job,
        'city_pop': data.city_pop,
        'age': data.age,
        'gender': data.gender,
        'hour': data.hour,
        'Weekday': data.Weekday,
        'Month': data.month,
        'Day': data.day
    }

    # Encode categorical variables using respective label encoders
    try:
        user_features['category'] = int(category_le.transform([user_features['category']])[0])
    except ValueError:
        user_features['category'] = int(category_le.transform(['unknown'])[0])  # fallback

    try:
        user_features['city'] = int(city_le.transform([user_features['city']])[0])
    except ValueError:
        user_features['city'] = int(city_le.transform(['unknown'])[0])

    try:
        user_features['job'] = int(job_le.transform([user_features['job']])[0])
    except ValueError:
        user_features['job'] = int(job_le.transform(['unknown'])[0])

    try:
        user_features['gender'] = int(gender_le.transform([user_features['gender']])[0])
    except ValueError:
        user_features['gender'] = int(gender_le.transform(['unknown'])[0])

    # Fill in mean values for missing features
    input_features = feature_means.copy()
    input_features.update(user_features)
    input_features.pop("is_fraud", None)

    # Convert to numpy array in the same order as during training
    X_input = np.array(list(input_features.values())).reshape(1, -1)

    # Make prediction
    prediction = model.predict(X_input)[0]
    proba = model.predict_proba(X_input)[0]

    return {
        "fraud_prediction": int(prediction),
        "probability_of_non_fraud": float(proba[0]),
        "probability_of_fraud": float(proba[1])
    }
